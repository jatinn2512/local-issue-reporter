import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import fs from "fs";
import fetch from "node-fetch";

import userRoutes from "./routes/userRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";

dotenv.config({ path: "./backend/.env" });

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("image"), (req, res) => {
  res.send({
    message: "Image uploaded successfully",
    imageUrl: `/uploads/${req.file.filename}`,
  });
});

app.post("/api/ai/detect", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });
  const filePath = req.file.path;

  try {
    const b64 = fs.readFileSync(filePath, { encoding: "base64" });

    // ✅ Use permissive captioning model
    const model = "nlpconnect/vit-gpt2-image-captioning";

    // ✅ Correct payload shape for this model:
    // send the data URI as a STRING (not { image: ... })
    const resp = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `data:image/jpeg;base64,${b64}`,
        }),
      }
    );

    const status = resp.status;
    let json;
    try {
      json = await resp.json();
    } catch (parseErr) {
      const text = await resp.text();
      console.error("HF response not JSON:", text);
      json = { rawText: text };
    }

    console.log("HF detect status:", status);
    console.log("HF raw (preview):", JSON.stringify(json).slice(0, 1000));

    if (status === 401) {
      return res
        .status(401)
        .json({ error: "HF Unauthorized - check HF_TOKEN", hf: json });
    }
    if (
      status === 503 ||
      (json &&
        json.error &&
        String(json.error).toLowerCase().includes("loading"))
    ) {
      return res.status(503).json({
        error: "Model loading on HF (try again in a few seconds)",
        hf: json,
      });
    }
    if (status === 429) {
      return res.status(429).json({ error: "HF rate limit", hf: json });
    }

    // ✅ Robust parsing across shapes
    let text = "";
    if (Array.isArray(json) && json[0]?.generated_text)
      text = json[0].generated_text;
    else if (Array.isArray(json) && json[0]?.caption) text = json[0].caption;
    else if (json?.generated_text) text = json.generated_text;
    else if (json?.caption) text = json.caption;
    else if (typeof json === "string") text = json;
    else if (json.error) text = `HF ERROR: ${json.error}`;
    else if (json.rawText) text = json.rawText;
    else text = JSON.stringify(json).slice(0, 1000);

    // Simple heuristic mapping to type
    const typeHints = [
      "pothole",
      "streetlight",
      "street light",
      "garbage",
      "trash",
      "water leak",
      "sewage",
      "overflow",
      "signal",
      "traffic",
      "tree",
      "fallen tree",
    ];
    const found =
      typeHints.find((h) => text.toLowerCase().includes(h)) || "other";

    return res.json({
      description: text,
      typeOfIssue: found,
      location: null,
      hf: json,
    });
  } catch (err) {
    console.error("HF detect error (catch):", err);
    return res.status(500).json({
      error: "detect failed",
      details: err?.message || err,
      hint: "check server logs",
    });
  } finally {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {}
  }
});

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.use("/api/users", userRoutes);
app.use("/api/issues", issueRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

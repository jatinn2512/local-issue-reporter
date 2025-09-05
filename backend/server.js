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

// ✅ MongoDB connect
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Uploads folder
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ✅ Multer config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Normal upload route
app.post("/api/ai/detect", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });
  const filePath = req.file.path;
  const providedLocation = req.body?.location || null;

  // cleanup filename to hint issue
  const cleanupName = (name) => {
    try {
      const raw = path.basename(name || "image");
      return raw
        .replace(/^\d+-/, "")
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    } catch {
      return "";
    }
  };

  try {
    const b64 = fs.readFileSync(filePath, { encoding: "base64" });
    const payload = JSON.stringify({ inputs: `data:image/jpeg;base64,${b64}` });

    const modelCandidates = [
      "Salesforce/blip-image-captioning-base",
      "nlpconnect/vit-gpt2-image-captioning",
    ];

    let finalJson = null;
    for (const model of modelCandidates) {
      try {
        const resp = await fetch(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.HF_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: payload,
          }
        );
        const raw = await resp.text();
        let json;
        try {
          json = JSON.parse(raw);
        } catch {
          json = { rawText: raw };
        }
        if (resp.ok) {
          finalJson = json;
          break;
        }
      } catch {}
    }

    // extract caption if available
    let textFromHF = "";
    if (finalJson) {
      if (Array.isArray(finalJson) && finalJson[0]?.generated_text)
        textFromHF = finalJson[0].generated_text;
      else if (Array.isArray(finalJson) && finalJson[0]?.caption)
        textFromHF = finalJson[0].caption;
      else if (finalJson?.generated_text) textFromHF = finalJson.generated_text;
      else if (finalJson?.caption) textFromHF = finalJson.caption;
      else if (finalJson?.rawText) textFromHF = finalJson.rawText;
    }

    // guess type from text + filename
    const filenameHint = cleanupName(filePath);
    const combined = ((textFromHF || "") + " " + (filenameHint || "")).toLowerCase();
    const typeHints = [
      { key: ["pothole", "hole", "crack"], type: "pothole" },
      { key: ["streetlight", "street light", "lamp"], type: "streetlight" },
      { key: ["garbage", "trash", "waste", "dump"], type: "garbage" },
      { key: ["water leak", "sewage", "flood"], type: "water" },
      { key: ["tree", "branch", "fallen tree"], type: "tree" },
      { key: ["signal", "traffic"], type: "signal" },
    ];
    let detectedType = "other";
    for (const h of typeHints) {
      if (h.key.some((kw) => combined.includes(kw))) {
        detectedType = h.type;
        break;
      }
    }

    // make natural readable description
    let description = "";
    if (textFromHF && textFromHF.length > 5 && !/error|not found/i.test(textFromHF)) {
      description = textFromHF.replace(/\s*\n\s*/g, " ").trim();
    } else {
      const issueLine = detectedType !== "other"
        ? `There seems to be a ${detectedType} problem in the area.`
        : "There is a civic issue in this area that needs attention.";
      const obsLine = filenameHint ? `It looks like ${filenameHint}.` : "The attached photo shows the issue clearly.";
      description = `${issueLine} ${obsLine}`;
    }

    if (providedLocation) {
      description += ` This was observed near ${providedLocation}.`;
    }
    description += " It is causing inconvenience to residents, so please inspect and resolve it as soon as possible.";

    return res.json({
      description,
      typeOfIssue: detectedType,
      location: providedLocation || null,
    });
  } catch (err) {
    console.error("AI detect error:", err);
    return res.status(500).json({ error: "detect failed", details: err?.message });
  } finally {
    try {
      fs.unlinkSync(filePath);
    } catch {}
  }
});


// ✅ AI Detect route (Hugging Face Inference)
// ✅ AI Detect route (Hugging Face Inference)
const handleImageChange = async (e) => {
  try {
    const file = e?.target?.files?.[0];
    if (!file) return;

    // preview straight away
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));

    setIsDetecting(true);
    setDescription("");
    setIssueType("");

    const fd = new FormData();
    fd.append("image", file);

    // include the current location value (if any) so server can include it in fallback paragraph
    if (location) fd.append("location", location);

    const DETECT_URL = "http://localhost:5000/api/ai/detect"; // change port if needed

    console.log("Sending image to detect endpoint...", file.name);

    const res = await fetch(DETECT_URL, {
      method: "POST",
      body: fd,
    });

    console.log("Detect HTTP status:", res.status);

    let data;
    try {
      data = await res.json();
    } catch (err) {
      const t = await res.text();
      console.error("Detect response not JSON:", err, t);
      setIsDetecting(false);
      return;
    }

    console.log("Detect response:", data);

    // Always set description if server returned one (fallback or HF)
    if (data.description) {
      // keep it as paragraph (textarea supports newlines). If server gives multiple sentences, they'll be shown.
      setDescription(data.description);
    } else {
      // safety fallback
      setDescription("Please describe the issue briefly.");
    }

    // Use server-detected issue type if available and not empty
    if (data.typeOfIssue) {
      setIssueType(data.typeOfIssue);
    } else {
      setIssueType("other");
    }
  } catch (err) {
    console.error("Detection error:", err);
  } finally {
    setIsDetecting(false);
  }
};


// ✅ Static uploads
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/issues", issueRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

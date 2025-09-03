import express from "express";
import Issue from "../models/Issue.js";  // ✅ extension .js zaruri hai
import multer from "multer";             // ✅ added for image upload

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // ✅ temp storage

// GET issues by user
router.get("/", async (req, res) => {
  try {
    const { reportedBy } = req.query;
    const issues = await Issue.find({ reportedBy });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Dummy AI detect route (test image upload)
router.post("/ai-detect", upload.single("image"), (req, res) => {
  res.json({ msg: "AI route working", file: req.file });
});

export default router;   // ✅ ESM export

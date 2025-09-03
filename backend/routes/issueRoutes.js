import express from "express";
import Issue from "../models/Issue.js";  // ✅ extension .js zaruri hai

const router = express.Router();

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

export default router;   // ✅ ESM export

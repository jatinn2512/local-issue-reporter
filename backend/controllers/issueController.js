import fetch from "node-fetch";
import Issue from "../models/Issue.js";
import User from "../models/User.js";

// ⚠️ Node 18+ me fetch built-in hai. Agar Node <18 hai to node-fetch import karna hoga.
export const createIssue = async (req, res) => {
  try {
    const { title, description, location, typeOfIssue, image, reportedBy } = req.body;

    // 1️⃣ Get user
    const user = await User.findOne({ email: reportedBy });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const today = new Date().toDateString(); // just date, no time

    // 2️⃣ Reset counter if day has changed
    if (!user.lastReportDate || user.lastReportDate.toDateString() !== today) {
      user.reportsToday = 0;
      user.lastReportDate = new Date();
    }

    // 3️⃣ Check limit
    if (user.reportsToday >= 10) {
      return res.status(400).json({ msg: "Daily report limit (10) reached!" });
    }

    // 4️⃣ Create issue
    const newIssue = new Issue({
      title,
      description,
      location,
      typeOfIssue,
      image,
      reportedBy,
    });

    await newIssue.save();

    // 5️⃣ Update user counter
    user.reportsToday += 1;
    user.lastReportDate = new Date();
    await user.save();

    // 6️⃣ Forward to Dummy Authority Portal
    try {
      await fetch("http://localhost:7000/authority/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          location,
          typeOfIssue,
          reportedBy,
        }),
      });
      console.log("📤 Report forwarded to authority portal");
    } catch (err) {
      console.error("❌ Failed to forward report to authority portal:", err.message);
    }

    res.status(201).json(newIssue);
  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

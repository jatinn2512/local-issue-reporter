import express from "express";
import User from "../models/userModel.js";
import Issue from "../models/issueModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware.js";
import nodemailer from "nodemailer";
import twilio from "twilio";


const router = express.Router();

// ✅ Twilio Client
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// ✅ Nodemailer Config (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Gmail
    pass: process.env.EMAIL_PASS, // App password
  },
});

// ✅ Register User
router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || (!email && !phone)) {
    return res.status(400).json({ message: "Name and either email or phone are required" });
  }

  try {
    // check existing user
    let userExists;
    if (email) userExists = await User.findOne({ email });
    if (!userExists && phone) userExists = await User.findOne({ phone });

    if (userExists) return res.status(400).json({ message: "User already exists" });

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    // ✅ Prepare notification messages
    const engMessage = `Hey ${name}, 🎉 You have successfully registered on AI Local Issue Reporter.`;
    const hindiMessage = `नमस्ते ${name}, 🎉 आपने AI Local Issue Reporter पर सफलतापूर्वक पंजीकरण कर लिया है।`;

    // ✅ Send Email
    if (email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "✅ Registration Successful | AI Local Issue Reporter",
        text: `${engMessage}\n\n${hindiMessage}`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.log("❌ Email error:", err);
        else console.log("📩 Email sent:", info.response);
      });
    }

    // ✅ Send SMS
    if (phone) {
      twilioClient.messages
        .create({
          body: `${engMessage}\n${hindiMessage}`,
          from: process.env.TWILIO_PHONE, // Your Twilio number
          to: `+91${phone}`, // Assuming India numbers
        })
        .then((msg) => console.log("📱 SMS sent:", msg.sid))
        .catch((err) => console.log("❌ SMS error:", err));
    }

    res.status(201).json({ message: "User registered & notification sent", user });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
});

// ✅ Login with Email/Password
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

// ✅ Login with Phone (OTP-based, simulated)
router.post("/login-phone", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone number required" });

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: "User not found" });

    const token = jwt.sign({ id: user._id, phone: user.phone }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Phone login successful", token });
  } catch (error) {
    console.error("Phone Login Error:", error);
    res.status(500).json({ message: "Error logging in with phone", error: error.message });
  }
});

// ✅ Report Issue (protected + daily limit)
router.post("/report", authMiddleware, async (req, res) => {
  const { title, location, typeOfIssue, description, image } = req.body;

  if (!title || !location || !typeOfIssue) {
    return res
      .status(400)
      .json({ message: "Title, location, and typeOfIssue are required" });
  }

  try {
    const identifier = req.user.email || req.user.phone;

    // Daily limit check
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Issue.countDocuments({
      reportedBy: identifier,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (count >= 15) {
      return res
        .status(429)
        .json({ message: "Daily limit reached. Please try after 24 hours." });
    }

    const issue = await Issue.create({
      title,
      location,
      typeOfIssue,
      description,
      image,
      reportedBy: identifier,
    });

    res.status(201).json({ message: "Issue reported successfully!", issue });
  } catch (error) {
    console.error("Report Error:", error);
    res
      .status(500)
      .json({ message: "Error reporting issue", error: error.message });
  }
});

// ✅ Get My Issues (protected)
router.get("/my-issues", authMiddleware, async (req, res) => {
  try {
    const identifier = req.user.email || req.user.phone;
    const issues = await Issue.find({ reportedBy: identifier });
    res.status(200).json({ issues });
  } catch (error) {
    console.error("Get My Issues Error:", error);
    res.status(500).json({ message: "Error fetching issues", error: error.message });
  }
});

export default router;

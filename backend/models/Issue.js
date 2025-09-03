import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    location: String,
    typeOfIssue: String,
    status: { type: String, default: "pending" },
    image: String,
    reportedBy: String,
  },
  { timestamps: true }
);

// ✅ Check if already compiled
const Issue = mongoose.models.Issue || mongoose.model("Issue", issueSchema);

export default Issue;


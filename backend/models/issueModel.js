import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },          // issue ka naam
    location: { type: String, required: true },       // kahan par problem hai
    typeOfIssue: { type: String, required: true },    // water, electricity, road...
    description: { type: String },                    // details of issue
    image: { type: String },                          // image ka URL (string path)
    status: { type: String, default: "pending" },     // pending/resolved
    reportedBy: { type: String, required: true }      // user ka email
  },
  { timestamps: true }
);

const Issue = mongoose.model("Issue", issueSchema);
export default Issue;

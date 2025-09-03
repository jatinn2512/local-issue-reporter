import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
const PORT = 7000;

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/localIssueReporter")
  .then(() => console.log("✅ Mongo Connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));

// ✅ Schema & Model
const issueSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    location: String,
    typeOfIssue: String,
    reportedBy: String,
    image: String,
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "issues" } // 👈 force correct collection
);
const Issue = mongoose.model("Issue", issueSchema);

// 🔎 Debug route - JSON check ke liye
app.get("/debug", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: "DB fetch failed", details: err.message });
  }
});
app.get("/ping", (req, res) => {
  res.send("🏓 Pong from Authority Server");
});

// ✅ Authority Reports route (HTML Table)
app.get("/authority/reports", async (req, res) => {
  try {
    const reports = await Issue.find().sort({ createdAt: -1 });
    let html = `
      <html>
        <head>
          <title>Authority Reports</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f9fafb; }
            h1 { color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #2563eb; color: white; }
            tr:nth-child(even) { background: #f1f5f9; }
            tr:hover { background: #e0f2fe; }
            .time { color: #6b7280; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <h1>📋 Authority Portal - Received Reports</h1>
          <table>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Location</th>
              <th>Type</th>
              <th>Reported By</th>
              <th>Time</th>
            </tr>
            ${reports
              .map(
                (r) => `
              <tr>
                <td>${r.title}</td>
                <td>${r.description}</td>
                <td>${r.location}</td>
                <td>${r.typeOfIssue}</td>
                <td>${r.reportedBy}</td>
                <td class="time">${new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            `
              )
              .join("")}
          </table>
        </body>
      </html>
    `;
    res.send(html);
  } catch (err) {
    res.status(500).send("Error fetching reports from DB");
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Authority Portal running at:`);
  console.log(`   http://localhost:${PORT}/authority/reports`);
  console.log(`   http://localhost:${PORT}/debug`);
});

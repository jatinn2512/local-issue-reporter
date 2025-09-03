import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 7000;

// ✅ dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// In-memory reports storage (demo purpose)
let reports = [];

// ✅ Route: receive reports (backend se yaha forward hoga)
app.post("/authority/receive", (req, res) => {
  const { title, description, location, typeOfIssue, reportedBy } = req.body;

  const newReport = {
    title,
    description,
    location,
    typeOfIssue,
    reportedBy,
    time: new Date().toLocaleString(),
  };

  reports.push(newReport);

  console.log("📩 New report received by authority:", newReport);

  res.json({ status: "ok", msg: "Report received by authority", report: newReport });
});

// ✅ Route: show all reports in a simple HTML table
app.get("/authority/reports", (req, res) => {
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
              <td class="time">${r.time}</td>
            </tr>
          `
            )
            .join("")}
        </table>
      </body>
    </html>
  `;
  res.send(html);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Authority Portal running at http://localhost:${PORT}/authority/reports`);
});

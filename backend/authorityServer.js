// authorityServer.js
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
const PORT = 7000;

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB connection (ensure same DB as main backend)
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
  { collection: "issues" }
);
const Issue = mongoose.model("Issue", issueSchema);

// Debug route - JSON check
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

// Update issue status (called by authority portal dropdown)
app.post("/authority/update-status", express.json(), async (req, res) => {
  const { id, status } = req.body;
  if (!id || !status) return res.status(400).json({ ok: false, message: "id and status required" });

  try {
    const updated = await Issue.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ ok: false, message: "Issue not found" });
    return res.json({ ok: true, issue: updated });
  } catch (err) {
    console.error("Update status error:", err);
    return res.status(500).json({ ok: false, message: "update failed", details: err.message });
  }
});

// Authority Reports route (HTML Table with dropdown actions)
app.get("/authority/reports", async (req, res) => {
  try {
    const reports = await Issue.find().sort({ createdAt: -1 });
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Authority Reports</title>
          <style>
            :root{ --muted:#6b7280; --blue:#2563eb; --vio:#7c3aed; --bg:#f9fafb; }
            body { font-family: Inter, Arial, sans-serif; margin: 18px; background: var(--bg); color: #0f172a; }
            h1 { color: var(--blue); margin-bottom: 6px; }
            .sub { color: var(--muted); margin-bottom: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #e6edf3; padding: 12px; text-align: left; vertical-align: top; }
            th { background: linear-gradient(90deg,var(--blue),var(--vio)); color: white; font-weight:700; }
            tr:nth-child(even) { background: #ffffff; }
            tr:hover { background: #f1f9ff; }
            .time { color: var(--muted); font-size: 0.9em; }
            .select-wrap { display:flex; gap:8px; align-items:center; }
            select.status-select { padding:6px 10px; border-radius:8px; border:1px solid #d1d5db; background:white; font-weight:600; cursor:pointer; }
            .status-badge { padding:6px 10px; border-radius:999px; font-weight:700; font-size:0.95em; display:inline-block; min-width:88px; text-align:center; }
            .status-pending { background:#fef3c7; color:#92400e; border:1px solid #fde68a; }
            .status-inprogress { background:#bfdbfe; color:#1e3a8a; border:1px solid #93c5fd; }
            .status-resolved { background:#bbf7d0; color:#065f46; border:1px solid #86efac; }
            .desc { max-width:420px; white-space: pre-wrap; line-height:1.35; color:#374151; font-size:0.95em; }
            @media (max-width:840px){
              table, thead, tbody, th, td, tr { display:block; }
              tr { margin-bottom: 12px; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(2,6,23,0.04); }
              th { display:none; }
              td { display:flex; justify-content:space-between; padding:12px; border:none; background:white; align-items:flex-start; }
              td.meta { flex-basis:100%; display:block; }
            }
            .small { font-size:0.9em; color:var(--muted); }
          </style>
        </head>
        <body>
          <h1>📋 Authority Portal - Received Reports</h1>
          <div class="sub">Use the dropdown to change status. Updates save immediately (no confirmation).</div>

          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Location</th>
                <th>Type</th>
                <th>Reported By</th>
                <th>Time</th>
                <th>Status</th>
                <th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              ${reports
                .map((r) => {
                  const statusClass =
                    r.status === "resolved" ? "status-resolved" : r.status === "in_progress" ? "status-inprogress" : "status-pending";
                  // selected flags
                  const selPending = r.status === "pending" ? "selected" : "";
                  const selIn = r.status === "in_progress" ? "selected" : "";
                  const selResolved = r.status === "resolved" ? "selected" : "";
                  return `
                  <tr id="row-${r._id}">
                    <td>${r.title || ""}</td>
                    <td class="desc">${(r.description || "").replace(/\\n/g, "<br>")}</td>
                    <td>${r.location || ""}</td>
                    <td>${r.typeOfIssue || ""}</td>
                    <td>${r.reportedBy || ""}</td>
                    <td class="time">${new Date(r.createdAt).toLocaleString()}</td>
                    <td><span class="status-badge ${statusClass}">${r.status || "pending"}</span></td>
                    <td>
                      <div class="select-wrap">
                        <select class="status-select" data-id="${r._id}" aria-label="Change status">
                          <option value="pending" ${selPending}>Pending</option>
                          <option value="in_progress" ${selIn}>In Progress</option>
                          <option value="resolved" ${selResolved}>Resolved</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>

          <script>
            // debounce helper to prevent double-fires if needed
            function debounce(fn, wait=300) {
              let t;
              return function(...args) {
                clearTimeout(t);
                t = setTimeout(()=>fn.apply(this,args), wait);
              }
            }

            async function sendUpdate(id, status, selectEl) {
              // visual feedback
              selectEl.disabled = true;
              const prevText = selectEl.options[selectEl.selectedIndex].text;
              selectEl.options[selectEl.selectedIndex].text = "Saving...";

              try {
                const res = await fetch('/authority/update-status', {
                  method: 'POST',
                  headers: {'Content-Type':'application/json'},
                  body: JSON.stringify({ id, status })
                });
                const j = await res.json();
                if (!j.ok) {
                  // restore and alert error
                  selectEl.disabled = false;
                  selectEl.options[selectEl.selectedIndex].text = prevText;
                  alert('Update failed: ' + (j.message || JSON.stringify(j)));
                  return;
                }
                // update badge text + class
                const row = document.getElementById('row-' + id);
                if (row) {
                  const badge = row.querySelector('.status-badge');
                  if (badge) {
                    badge.textContent = j.issue.status;
                    badge.className = 'status-badge ' + (j.issue.status === 'resolved' ? 'status-resolved' : j.issue.status === 'in_progress' ? 'status-inprogress' : 'status-pending');
                  }
                }
              } catch (e) {
                alert('Update error: ' + e.message);
              } finally {
                // restore select text and re-enable
                selectEl.disabled = false;
                // ensure displayed option text is correct (label mapping)
                // (options are literal labels so nothing to change)
              }
            }

            // attach change listeners with debounce
            document.querySelectorAll('select.status-select').forEach((sel) => {
              const id = sel.getAttribute('data-id');
              sel.addEventListener('change', debounce((ev) => {
                const newStatus = ev.target.value;
                // directly update, no confirm
                sendUpdate(id, newStatus, ev.target);
              }, 200));
            });
          </script>
        </body>
      </html>
    `;
    res.send(html);
  } catch (err) {
    console.error("Error rendering reports:", err);
    res.status(500).send("Error fetching reports from DB");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Authority Portal running at: http://localhost:${PORT}/authority/reports`);
  console.log(`✅ Debug endpoint: http://localhost:${PORT}/debug`);
});

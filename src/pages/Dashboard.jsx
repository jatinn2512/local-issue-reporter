import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import Card from "../components/Card";

function Dashboard() {
  const { lang } = useLanguage();
  const [reports, setReports] = useState([]);
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        if (!userEmail) return;
        const res = await fetch(
          `http://localhost:5000/api/issues?reportedBy=${userEmail}`
        );
        const data = await res.json();
        setReports(data);
      } catch (error) {
        console.error("Error fetching issues:", error);
      }
    };
    fetchReports();
  }, [userEmail]);

  return (
    <div className="p-8 min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      {/* Header */}
      <h2 className="text-4xl font-extrabold mb-8 w-full max-w-5xl text-left bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
        {lang === "en" ? "Dashboard" : "डैशबोर्ड"}
      </h2>

      {/* Reports list */}
      <div className="grid gap-6 md:grid-cols-2 w-full max-w-5xl overflow-y-auto max-h-[70vh] pr-2">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div
              key={report._id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 flex flex-col border border-gray-700/60 hover:border-blue-400/50 hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-300"
            >
              <Card
                title={lang === "en" ? report.title : `अनुवाद: ${report.title}`}
                description={
                  lang === "en"
                    ? report.description
                    : `अनुवाद: ${report.description}`
                }
                location={report.location}
                status={report.status}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic text-center col-span-2">
            {lang === "en"
              ? "No issues reported yet."
              : "अभी तक कोई समस्या रिपोर्ट नहीं की गई है।"}
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

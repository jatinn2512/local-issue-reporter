// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import Card from "../components/Card";

function Dashboard() {
  const { lang } = useLanguage();
  const [reports, setReports] = useState([]);
  const userEmail = localStorage.getItem("userEmail");

  const fetchReports = async () => {
    try {
      if (!userEmail) return;
      const res = await fetch(
        `http://localhost:5000/api/issues?reportedBy=${encodeURIComponent(userEmail)}`
      );
      if (!res.ok) {
        console.error("Fetch error", res.status);
        return;
      }
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  useEffect(() => {
    fetchReports();
    const iv = setInterval(fetchReports, 8000); // poll every 8s
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  return (
    <div className="p-8 min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-50 via-gray-100 to-white text-gray-900">
      {/* Header */}
      <h2 className="text-4xl font-extrabold mb-10 w-full max-w-5xl text-left bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-wide drop-shadow-sm">
        {lang === "en" ? "Dashboard" : "डैशबोर्ड"}
      </h2>

      {/* Reports list */}
      <div className="grid gap-8 md:grid-cols-2 w-full max-w-5xl overflow-y-auto max-h-[70vh] pr-2">
        {reports.length > 0 ? (
          reports.map((report) => (
            <Card
              key={report._id}
              title={lang === "en" ? report.title : `अनुवाद: ${report.title}`}
              description={
                lang === "en"
                  ? report.description
                  : `अनुवाद: ${report.description}`
              }
              location={report.location}
              status={report.status}
            />
          ))
        ) : (
          <p className="text-gray-500 italic text-center col-span-2">
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

// src/components/Card.jsx
import React from "react";

function Card({ title, description, location, status }) {
  // Normalize incoming status to expected keys
  const s = (status || "").toString().toLowerCase();

  // Map canonical status -> styles & display text
  const map = {
    pending: {
      class: "bg-yellow-100 text-yellow-700 border border-yellow-300 shadow-sm",
      label: "Pending",
    },
    in_progress: {
      class: "bg-blue-100 text-blue-700 border border-blue-300 shadow-sm",
      label: "In Progress",
    },
    "in-progress": {
      class: "bg-blue-100 text-blue-700 border border-blue-300 shadow-sm",
      label: "In Progress",
    },
    resolved: {
      class: "bg-green-100 text-green-700 border border-green-300 shadow-sm",
      label: "Solved",
    },
    complete: {
      class: "bg-green-100 text-green-700 border border-green-300 shadow-sm",
      label: "Solved",
    },
  };

  const statusInfo = map[s] || { class: "bg-gray-100 text-gray-600", label: s || "Unknown" };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md p-6 flex flex-col border border-gray-200 hover:border-blue-400/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
      {/* Title */}
      <h3 className="font-extrabold text-2xl text-gray-900 mb-3 tracking-wide">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-700 mb-5 leading-relaxed line-clamp-3">
        {description}
      </p>

      {/* Meta Info */}
      <div className="mt-auto flex items-center justify-between">
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <span className="text-lg">📍</span>
          <span className="italic">{location || "—"}</span>
        </p>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors duration-200 ${statusInfo.class}`}
        >
          {statusInfo.label}
        </span>
      </div>
    </div>
  );
}

export default Card;

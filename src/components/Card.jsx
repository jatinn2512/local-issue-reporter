import React from 'react';

function Card({ title, description, location, status }) {
  return (
    <div className="border border-gray-300 p-4 rounded shadow hover:shadow-lg transition bg-white">
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-gray-700 mb-1">{description}</p>
      <p className="text-gray-700 mb-1"><strong>Location:</strong> {location}</p>
      <p className="text-gray-700 mb-1"><strong>Status:</strong> {status}</p>
    </div>
  );
}

export default Card;

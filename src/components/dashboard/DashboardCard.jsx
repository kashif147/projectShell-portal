import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardCard = ({ title, description, icon, link }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
      <div className="text-4xl text-blue-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <button
        onClick={() => navigate(link)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
      >
        {`View ${title}`}
      </button>
    </div>
  );
};

export default DashboardCard; 
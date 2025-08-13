import React from 'react';

const DashboardCard = ({
  description,
  icon,
  title,
  buttonText,
  onPress,
  disabled = false,
}) => {

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col items-center text-center h-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="text-3xl sm:text-4xl text-blue-600 mb-3 sm:mb-4">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-3 sm:mb-6 text-sm sm:text-base flex-grow">
        {description}
      </p>
      <button
        onClick={() => onPress && onPress()}
        className={`px-4 sm:px-6 py-2 rounded-md transition-colors w-full sm:w-auto mt-auto ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        disabled={disabled}>
        {buttonText}
      </button>
    </div>
  );
};

export default DashboardCard;

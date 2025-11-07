import React from 'react';

const QuickActionButton = ({
  title,
  subtitle,
  icon: Icon,
  onClick,
  disabled = false,
  colorScheme = 'blue',
}) => {
  // Color configurations for different themes
  const colorSchemes = {
    blue: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      hoverBorder: 'hover:border-blue-400',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    green: {
      border: 'border-green-200',
      bg: 'bg-green-50',
      hoverBorder: 'hover:border-green-400',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    purple: {
      border: 'border-purple-200',
      bg: 'bg-purple-50',
      hoverBorder: 'hover:border-purple-400',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    orange: {
      border: 'border-orange-200',
      bg: 'bg-orange-50',
      hoverBorder: 'hover:border-orange-400',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    teal: {
      border: 'border-teal-200',
      bg: 'bg-teal-50',
      hoverBorder: 'hover:border-teal-400',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
    },
  };

  const colors = colorSchemes[colorScheme] || colorSchemes.blue;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
        disabled
          ? 'cursor-not-allowed opacity-75'
          : `${colors.hoverBorder} hover:shadow-md`
      } ${colors.border} ${colors.bg}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${colors.iconBg}`}>
        <Icon className={`text-2xl ${colors.iconColor}`} />
      </div>
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 text-center">{subtitle}</p>
    </button>
  );
};

export default QuickActionButton;


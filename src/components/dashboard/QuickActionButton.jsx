import React from 'react';

const QuickActionButton = ({
  title,
  subtitle,
  icon: Icon,
  onClick,
  disabled = false,
  colorScheme = 'blue',
}) => {
  // Color configurations with gradients and modern styling
  const colorSchemes = {
    blue: {
      gradient: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
      hoverGradient: 'hover:from-blue-100 hover:to-blue-200/50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconShadow: 'shadow-blue-500/30',
      border: 'border-blue-100',
      hoverBorder: 'hover:border-blue-300',
    },
    green: {
      gradient: 'bg-gradient-to-br from-green-50 to-green-100/50',
      hoverGradient: 'hover:from-green-100 hover:to-green-200/50',
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      iconShadow: 'shadow-green-500/30',
      border: 'border-green-100',
      hoverBorder: 'hover:border-green-300',
    },
    purple: {
      gradient: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
      hoverGradient: 'hover:from-purple-100 hover:to-purple-200/50',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconShadow: 'shadow-purple-500/30',
      border: 'border-purple-100',
      hoverBorder: 'hover:border-purple-300',
    },
    orange: {
      gradient: 'bg-gradient-to-br from-orange-50 to-orange-100/50',
      hoverGradient: 'hover:from-orange-100 hover:to-orange-200/50',
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      iconShadow: 'shadow-orange-500/30',
      border: 'border-orange-100',
      hoverBorder: 'hover:border-orange-300',
    },
    teal: {
      gradient: 'bg-gradient-to-br from-teal-50 to-teal-100/50',
      hoverGradient: 'hover:from-teal-100 hover:to-teal-200/50',
      iconBg: 'bg-gradient-to-br from-teal-500 to-teal-600',
      iconShadow: 'shadow-teal-500/30',
      border: 'border-teal-100',
      hoverBorder: 'hover:border-teal-300',
    },
  };

  const colors = colorSchemes[colorScheme] || colorSchemes.blue;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-center p-6 rounded-xl border-2
        transition-all duration-300 ease-in-out transform
        ${disabled
          ? 'cursor-not-allowed opacity-60'
          : `${colors.hoverBorder} ${colors.hoverGradient} hover:shadow-xl hover:scale-105 hover:-translate-y-1 active:scale-100`
        }
        ${colors.border} ${colors.gradient}
        shadow-md backdrop-blur-sm
      `}
    >
      {/* Icon container with gradient and shadow */}
      <div className={`
        w-14 h-14 rounded-full flex items-center justify-center mb-4
        ${colors.iconBg} shadow-lg ${colors.iconShadow}
        transform transition-transform duration-300
        ${!disabled && 'group-hover:scale-110'}
      `}>
        <Icon className="text-2xl text-white" />
      </div>
      
      {/* Title with better typography */}
      <h3 className="font-bold text-gray-900 mb-1.5 text-base tracking-tight">
        {title}
      </h3>
      
      {/* Subtitle with improved contrast */}
      <p className="text-xs text-gray-600 text-center leading-relaxed font-medium">
        {subtitle}
      </p>
      
      {/* Subtle shine effect overlay */}
      {!disabled && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/5 to-white/30 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
    </button>
  );
};

export default QuickActionButton;


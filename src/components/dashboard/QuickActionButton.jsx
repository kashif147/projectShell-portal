import React from 'react';
import Spinner from '../common/Spinner';

const QuickActionButton = ({
  title,
  subtitle,
  icon: Icon,
  onClick,
  disabled = false,
  colorScheme = 'blue',
  loading = false,
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
        relative flex flex-col items-center justify-center p-2 sm:p-2.5 lg:p-3 rounded-xl border
        transition-all duration-300 ease-in-out transform
        ${disabled
          ? 'cursor-not-allowed opacity-60'
          : `${colors.hoverBorder} ${colors.hoverGradient} hover:shadow-md sm:hover:scale-[1.02] active:scale-100`
        }
        ${colors.border} ${colors.gradient}
        shadow-sm backdrop-blur-sm
      `}
    >
      <div className={`
        w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center mb-1 sm:mb-1.5
        ${colors.iconBg} shadow-md ${colors.iconShadow}
        transform transition-transform duration-300
        ${!disabled && 'group-hover:scale-110'}
        ${loading && 'animate-spin'}
      `}>
        {loading ? (
          <Spinner size={16} color="#fff" loading={loading} />
        ) : (
          <Icon className="text-sm sm:text-base lg:text-lg text-white" />
        )}
      </div>

      <h3 className="font-bold text-gray-900 mb-0.5 text-[11px] sm:text-xs lg:text-sm tracking-tight">
        {title}
      </h3>

      <p className="text-[9px] sm:text-[10px] text-gray-600 text-center leading-snug font-medium">
        {subtitle}
      </p>

      {!disabled && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/5 to-white/30 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
    </button>
  );
};

export default QuickActionButton;


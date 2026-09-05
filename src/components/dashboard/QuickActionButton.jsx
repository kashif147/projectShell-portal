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
  const colorSchemes = {
    blue: {
      gradient: 'bg-gradient-to-br from-blue-50/80 to-indigo-50/60',
      hoverGradient: 'hover:from-blue-100/90 hover:to-indigo-100/70',
      iconBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600',
      iconShadow: 'shadow-blue-500/25',
      border: 'border-blue-100/80',
      hoverBorder: 'hover:border-blue-300',
      textColor: 'text-blue-900',
    },
    green: {
      gradient: 'bg-gradient-to-br from-emerald-50/80 to-teal-50/60',
      hoverGradient: 'hover:from-emerald-100/90 hover:to-teal-100/70',
      iconBg: 'bg-gradient-to-tr from-emerald-500 to-teal-600',
      iconShadow: 'shadow-emerald-500/25',
      border: 'border-emerald-100/80',
      hoverBorder: 'hover:border-emerald-300',
      textColor: 'text-emerald-900',
    },
    purple: {
      gradient: 'bg-gradient-to-br from-purple-50/80 to-fuchsia-50/60',
      hoverGradient: 'hover:from-purple-100/90 hover:to-fuchsia-100/70',
      iconBg: 'bg-gradient-to-tr from-purple-500 to-fuchsia-600',
      iconShadow: 'shadow-purple-500/25',
      border: 'border-purple-100/80',
      hoverBorder: 'hover:border-purple-300',
      textColor: 'text-purple-900',
    },
    orange: {
      gradient: 'bg-gradient-to-br from-amber-50/80 to-orange-50/60',
      hoverGradient: 'hover:from-amber-100/90 hover:to-orange-100/70',
      iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-600',
      iconShadow: 'shadow-amber-500/25',
      border: 'border-amber-100/80',
      hoverBorder: 'hover:border-amber-300',
      textColor: 'text-amber-900',
    },
    teal: {
      gradient: 'bg-gradient-to-br from-cyan-50/80 to-teal-50/60',
      hoverGradient: 'hover:from-cyan-100/90 hover:to-teal-100/70',
      iconBg: 'bg-gradient-to-tr from-cyan-500 to-teal-600',
      iconShadow: 'shadow-cyan-500/25',
      border: 'border-cyan-100/80',
      hoverBorder: 'hover:border-cyan-300',
      textColor: 'text-cyan-900',
    },
  };

  const colors = colorSchemes[colorScheme] || colorSchemes.blue;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-center p-3 sm:p-3.5 lg:p-4 rounded-2xl border
        transition-all duration-250 ease-out group
        ${disabled
          ? 'cursor-not-allowed opacity-50'
          : `${colors.hoverBorder} ${colors.hoverGradient} hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]`
        }
        ${colors.border} ${colors.gradient}
        shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-sm
      `}
    >
      <div className={`
        w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-2
        ${colors.iconBg} shadow-md ${colors.iconShadow}
        transition-transform duration-200 group-hover:scale-105
      `}>
        {loading ? (
          <Spinner size={18} color="#fff" loading={loading} />
        ) : (
          <Icon className="text-base sm:text-lg text-white" />
        )}
      </div>

      <h3 className="font-bold text-slate-900 mb-0.5 text-xs sm:text-sm tracking-tight text-center">
        {title}
      </h3>

      <p className="text-[10px] sm:text-xs text-slate-500 text-center leading-snug font-medium line-clamp-1">
        {subtitle}
      </p>
    </button>
  );
};

export default QuickActionButton;

import React from 'react';

export const Card = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_10px_25px_-5px_rgba(15,23,42,0.04)] ${
        hoverable
          ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_6px_rgba(15,23,42,0.05),0_16px_30px_-5px_rgba(15,23,42,0.08)] hover:border-slate-300/80'
          : ''
      } ${className}`}
      {...props}>
      {children}
    </div>
  );
};

export default Card;
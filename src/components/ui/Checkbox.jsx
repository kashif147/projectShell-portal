import React from 'react';

export const Checkbox = ({
  label,
  name,
  className = '',
  required = false,
  showValidation = false,
  checked = false,
  ...props
}) => {
  const isEmpty = required && !checked && showValidation;

  const labelClasses = `
    ml-2.5 text-sm font-medium text-slate-700 select-none cursor-pointer leading-snug
    ${isEmpty ? 'text-red-600' : ''}
  `;

  return (
    <div className={`flex items-start ${className}`}>
      <input
        type="checkbox"
        id={name}
        name={name}
        className={`
          h-4.5 w-4.5 text-blue-600 focus:ring-2 focus:ring-blue-500/20 border-slate-300 rounded-md mt-0.5 flex-shrink-0 cursor-pointer transition-colors
          ${isEmpty ? 'border-red-400 focus:ring-red-500/20' : ''}
        `}
        checked={checked}
        {...props}
      />
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
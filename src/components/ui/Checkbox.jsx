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
    ml-2 text-sm
    ${isEmpty ? 'text-red-600' : 'text-gray-700'}
  `;

  return (
    <div className={`flex items-start ${className}`}>
      <input
        type="checkbox"
        id={name}
        name={name}
        className={`
          h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5 flex-shrink-0
          ${isEmpty ? 'border-red-500' : ''}
        `}
        checked={checked}
        {...props}
      />
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label}
          {/* {isEmpty && <span className="ml-1 text-xs">(Required)</span>} */}
        </label>
      )}
    </div>
  );
};

export default Checkbox; 
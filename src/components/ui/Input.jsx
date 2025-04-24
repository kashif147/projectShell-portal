import React from 'react';

export const Input = ({
  label,
  name,
  required = false,
  type = 'text',
  readOnly = false,
  multiline = false,
  className = '',
  ...props
}) => {
  const inputClasses = `
    w-full px-3 py-2 border rounded-md
    ${readOnly ? 'bg-gray-100' : 'bg-white'}
    ${required ? 'border-blue-500' : 'border-gray-300'}
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${className}
  `;

  if (multiline) {
    return (
      <div className="flex flex-col">
        {label && (
          <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          id={name}
          name={name}
          readOnly={readOnly}
          className={inputClasses}
          rows={4}
          {...props}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        readOnly={readOnly}
        className={inputClasses}
        {...props}
      />
    </div>
  );
};

export default Input; 
import React from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export const Input = ({
  label,
  name,
  required = false,
  type = 'text',
  readOnly = false,
  multiline = false,
  className = '',
  value = '',
  showValidation = false,
  ...props
}) => {
  const isEmpty = required && !value && showValidation;
  const inputClasses = `
    w-full px-3 py-2 border rounded-md
    ${readOnly ? 'bg-gray-100' : ''}
    ${props.disabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white'}
    ${isEmpty ? 'border-red-500 bg-red-50' : required ? 'border-blue-500' : 'border-gray-300'}
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${className}
  `;

  const labelClasses = `
    mb-1 text-sm font-medium
    ${isEmpty ? 'text-red-600' : 'text-gray-700'}
  `;

  if (multiline) {
    return (
      <div className="flex flex-col">
        {label && (
          <label htmlFor={name} className={labelClasses}>
            {label} {required && <span className="text-red-500">*</span>}
            {isEmpty && <span className="ml-1 text-xs text-red-500">(Required)</span>}
          </label>
        )}
        <div className="relative">
          <textarea
            id={name}
            name={name}
            readOnly={readOnly}
            className={inputClasses}
            rows={4}
            value={value}
            {...props}
          />
          {isEmpty && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
              <ExclamationCircleOutlined />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
          {isEmpty && <span className="ml-1 text-xs text-red-500">(Required)</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          readOnly={readOnly}
          className={inputClasses}
          value={value}
          {...props}
        />
        {isEmpty && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <ExclamationCircleOutlined />
          </div>
        )}
      </div>
    </div>
  );
};

export default Input; 
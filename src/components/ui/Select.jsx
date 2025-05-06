import React from 'react';
import { ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

export const Select = ({
  label,
  name,
  options = [],
  required = false,
  defaultValue,
  className = '',
  value = '',
  showValidation = false,
  tooltip,
  ...props
}) => {
  const isEmpty = required && !value && showValidation;
  const selectClasses = `
    w-full px-3 py-2 border rounded-md bg-white
    ${props.disabled ? 'bg-gray-300 border-gray-400 text-gray-400 cursor-not-allowed' : 'bg-white'}
    ${isEmpty ? 'border-red-500 bg-red-50' : required ? 'border-blue-500' : 'border-gray-300'}
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${className}
  `;

  const labelClasses = `
    mb-1 text-sm font-medium
    ${isEmpty ? 'text-red-600' : 'text-gray-700'}
  `;

  // Determine the actual value to use
  const actualValue = value || defaultValue || '';

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={name} className={labelClasses}>
          <span className="flex items-center gap-1">
            {label} {required && <span className="text-red-500">*</span>}
            {tooltip && (
              <Tooltip title={tooltip}>
                <InfoCircleOutlined className="text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            )}
            {isEmpty && (
              <span className="ml-1 text-xs text-red-500">(Required)</span>
            )}
          </span>
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          name={name}
          value={actualValue}
          className={selectClasses}
          {...props}>
          <option value="">Select...</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {isEmpty && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
            <ExclamationCircleOutlined />
          </div>
        )}
      </div>
    </div>
  );
};

export default Select;

import React from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Radio as AntRadio } from 'antd';

export const Radio = ({
  label,
  name,
  options = [],
  required = false,
  className = '',
  value = '',
  showValidation = false,
  disabled = false,
  onChange,
  ...props
}) => {
  const isEmpty = required && !value && showValidation;

  const labelClasses = `
    block text-sm font-medium mb-2
    ${isEmpty ? 'text-red-600' : 'text-gray-700'}
  `;

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="flex flex-col">
      {label && (
        <label className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
          {isEmpty && <span className="ml-1 text-xs text-red-500">(Required)</span>}
        </label>
      )}
      <div className="relative">
        <AntRadio.Group
          name={name}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isEmpty ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          <div className="flex flex-row flex-wrap gap-4">
            {options.map(option => (
              <AntRadio
                key={option.value}
                value={option.value}
                className="mb-0"
                disabled={disabled}
              >
                {option.label}
              </AntRadio>
            ))}
          </div>
        </AntRadio.Group>
        {isEmpty && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
            <ExclamationCircleOutlined />
          </div>
        )}
      </div>
    </div>
  );
};

export default Radio; 
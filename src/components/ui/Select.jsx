import React from 'react';
import {
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Tooltip, Select as AntSelect } from 'antd';

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
  labelExtra,
  isSearchable = false,
  onChange,
  ...props
}) => {
  const isEmpty = required && !value && showValidation;
  const selectClasses = `
    w-full h-10 
    ${props.disabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white'}
    ${isEmpty ? 'border-red-500 bg-red-50' : required ? 'border-blue-500' : ''}
    ${className}
  `;

  const labelClasses = `
    mb-1 text-sm font-medium
    ${isEmpty ? 'text-red-600' : 'text-gray-700'}
  `;

  // Determine the actual value to use
  const actualValue = value || defaultValue || '';

  const handleChange = newValue => {
    if (onChange) {
      // Create a synthetic event to match the native select's event structure
      const event = {
        target: {
          name,
          value: newValue,
        },
      };
      onChange(event);
    }
  };

  if (isSearchable) {
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
              {labelExtra && (
                <span className="ml-2 text-xs text-gray-500">{labelExtra}</span>
              )}
              {isEmpty && (
                <span className="ml-1 text-xs text-red-500">(Required)</span>
              )}
            </span>
          </label>
        )}
        <div className="relative">
          <AntSelect
            id={name}
            name={name}
            value={actualValue}
            className={selectClasses}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              if (!option || !option.children) return false;
              return option.children
                .toLowerCase()
                .includes(input.toLowerCase());
            }}
            onChange={handleChange}
            {...props}>
            {options.map(option => (
              <AntSelect.Option key={option.value} value={option.value}>
                {option.label}
              </AntSelect.Option>
            ))}
          </AntSelect>
          {isEmpty && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
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
          <span className="flex items-center gap-1">
            {label} {required && <span className="text-red-500">*</span>}
            {tooltip && (
              <Tooltip title={tooltip}>
                <InfoCircleOutlined className="text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            )}
            {labelExtra && (
              <span className="ml-2 text-xs text-gray-500">{labelExtra}</span>
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
          className={`
            w-full px-3 py-2 border rounded-md
            ${props.disabled ? 'bg-gray-200 text-gray-800 cursor-not-allowed border-gray-300' : 'bg-white border-gray-300'}
            ${isEmpty ? 'border-red-500 bg-red-50' : required ? 'border-blue-500' : ''}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${className}
          `}
          onChange={onChange}
          {...props}>
          <option value="">Select...</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {isEmpty && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
            <ExclamationCircleOutlined />
          </div>
        )}
      </div>
    </div>
  );
};

export default Select;

import React from 'react';
import {
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Tooltip, Select as AntSelect } from 'antd';

const getOptionText = value => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(getOptionText).join(' ');
  }
  if (React.isValidElement(value)) {
    return getOptionText(value.props?.children);
  }
  return String(value);
};

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
  isSearchable = true,
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

  const actualValue = value ?? defaultValue ?? undefined;
  const selectValue = actualValue === '' ? undefined : actualValue;

  const handleChange = newValue => {
    if (onChange) {
      const event = {
        target: {
          name,
          value: newValue ?? '',
        },
      };
      onChange(event);
    }
  };

  const handleClear = event => {
    event?.preventDefault();
    event?.stopPropagation();
    handleChange(undefined);
  };

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
          value={selectValue}
          className={selectClasses}
          showSearch={isSearchable}
          allowClear
          optionFilterProp="children"
          filterOption={(input, option) =>
            getOptionText(option?.children || option?.label)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          popupRender={menu => (
            <>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-white"
                disabled={props.disabled || selectValue == null}
                onMouseDown={event => event.preventDefault()}
                onClick={handleClear}>
                Clear selection
              </button>
              <div className="border-t border-gray-100" />
              {menu}
            </>
          )}
          onChange={handleChange}
          {...props}>
          {options.map(option => (
            <AntSelect.Option key={option.value} value={option.value}>
              {option.label}
            </AntSelect.Option>
          ))}
        </AntSelect>
        {isEmpty && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
            <ExclamationCircleOutlined />
          </div>
        )}
      </div>
    </div>
  );
};

export default Select;

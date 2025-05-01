import React from 'react';
import { TreeSelect as AntTreeSelect } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export const TreeSelect = ({
  label,
  name,
  treeData = [],
  required = false,
  defaultValue,
  className = '',
  value = [],
  showValidation = false,
  multiple = false,
  maxTagCount,
  maxTagPlaceholder,
  placeholder = 'Select...',
  ...props
}) => {
  const isEmpty = required && (!value || value.length === 0) && showValidation;
  
  const containerClasses = `
    ${className}
  `;

  const labelClasses = `
    mb-1 text-sm font-medium
    ${isEmpty ? 'text-red-600' : 'text-gray-700'}
  `;

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
          {isEmpty && <span className="ml-1 text-xs text-red-500">(Required)</span>}
        </label>
      )}
      <div className="relative">
        <AntTreeSelect
          id={name}
          name={name}
          value={value}
          treeData={treeData}
          multiple={multiple}
          maxTagCount={maxTagCount}
          maxTagPlaceholder={maxTagPlaceholder}
          placeholder={placeholder}
          className={`
            w-full
            ${isEmpty ? 'border-red-500' : 'border-gray-300'}
            ${containerClasses}
          `}
          {...props}
        />
        {isEmpty && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
            <ExclamationCircleOutlined />
          </div>
        )}
      </div>
    </div>
  );
};

export default TreeSelect; 
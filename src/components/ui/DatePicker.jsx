import React, { useState, useEffect } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export const DatePicker = ({
  label,
  name,
  required = false,
  className = '',
  value,
  onChange,
  disableAgeValidation = false,
  showValidation = false,
  ...props
}) => {
  const [dateValue, setDateValue] = useState('');
  const [error, setError] = useState('');
  const [displayValue, setDisplayValue] = useState('');

  const isEmpty = required && !value && showValidation;

  const inputClasses = `
    w-full px-3 py-2 border rounded-md bg-white
    ${isEmpty ? 'border-red-500 bg-red-50' : required ? 'border-blue-500' : 'border-gray-300'}
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${error ? 'border-red-500' : ''}
    ${className}
  `;

  const labelClasses = `
    mb-1 text-sm font-medium
    ${isEmpty ? 'text-red-600' : 'text-gray-700'}
  `;

  const validateAge = (dateString) => {
    if (disableAgeValidation) return 16; // Skip age validation if disabled
    
    const today = new Date();
    const birthDate = new Date(dateString);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const parseDate = (displayDate) => {
    if (!displayDate) return '';
    const [day, month, year] = displayDate.split('/');
    return `${year}-${month}-${day}`;
  };

  const handleInputChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 8) {
      value = value.slice(0, 8);
    }

    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i === 2 || i === 4) {
        formattedValue += '/';
      }
      formattedValue += value[i];
    }

    setDisplayValue(formattedValue);

    if (formattedValue.length === 10) {
      const [day, month, year] = formattedValue.split('/');
      const date = new Date(`${year}-${month}-${day}`);
      
      if (!isNaN(date.getTime())) {
        const isoDate = date.toISOString().split('T')[0];
        setDateValue(isoDate);
        
        const age = validateAge(isoDate);
        if (age < 16 && !disableAgeValidation) {
          setError('You must be 16 years or older to proceed');
        } else {
          setError('');
        }

        if (onChange) {
          const event = {
            target: {
              name,
              value: isoDate
            }
          };
          onChange(event);
        }
      }
    } else {
      setDateValue('');
      setError('');
    }
  };

  useEffect(() => {
    if (value) {
      setDateValue(value);
      setDisplayValue(formatDate(value));
    }
  }, [value]);

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
          type="text"
          id={name}
          name={name}
          className={inputClasses}
          value={displayValue}
          onChange={handleInputChange}
          placeholder="DD/MM/YYYY"
          maxLength={10}
          {...props}
        />
        {isEmpty && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
            <ExclamationCircleOutlined />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default DatePicker; 
import React, { useState, useEffect } from 'react';
import { ExclamationCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { DatePicker as AntDatePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const isEmpty = required && !value && showValidation;

  const inputClasses = `
    w-full px-3 py-2 border rounded-md pr-10
    ${props.disabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white'}
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
    if (disableAgeValidation) return 16;

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
    return dayjs(date).format('DD/MM/YYYY');
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
               value: dayjs(isoDate).format('DD/MM/YYYY')  // ← formatted return value
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

  const handleCalendarChange = (date) => {
    if (date) {
      const isoDate = date.format('YYYY-MM-DD');
      setDateValue(isoDate);
      setDisplayValue(date.format('DD/MM/YYYY'));

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
            value: dayjs(isoDate).format('DD/MM/YYYY')  // ← formatted return value
          }
        };
        onChange(event);
      }
    } else {
      setDateValue('');
      setDisplayValue('');
      setError('');
    }
    setIsCalendarOpen(false);
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
          onChange={props.disabled ? undefined : handleInputChange}
          placeholder="DD/MM/YYYY"
          maxLength={10}
          disabled={props.disabled}
          {...props}
        />
        <button
          type="button"
          onClick={() => !props.disabled && setIsCalendarOpen(true)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 
            ${props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          disabled={props.disabled}
        >
          <CalendarOutlined />
        </button>
        {isEmpty && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
            <ExclamationCircleOutlined />
          </div>
        )}
        {isCalendarOpen && (
          <div className="absolute z-10 mt-1">
            <AntDatePicker
              open={isCalendarOpen}
              onChange={handleCalendarChange}
              value={dateValue ? dayjs(dateValue) : null}
              format="DD/MM/YYYY"
              disabled={props.disabled}
              onOpenChange={setIsCalendarOpen}
              allowClear={false}
            />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default DatePicker; 
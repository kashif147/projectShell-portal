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
    w-full px-3.5 py-2.5 text-sm rounded-xl border pr-10 shadow-sm transition-all duration-200
    ${props.disabled ? 'bg-slate-100/80 text-slate-700 cursor-not-allowed border-slate-200' : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'}
    ${isEmpty ? 'border-red-400 bg-red-50/50 focus:ring-red-500/15 focus:border-red-500' : 'focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500'}
    ${error ? 'border-red-400' : ''}
    ${className}
  `;

  const labelClasses = `
    mb-1.5 text-xs font-semibold tracking-tight uppercase text-slate-600
    ${isEmpty ? 'text-red-600' : ''}
  `;

  const validateAge = (dateString) => {
    if (disableAgeValidation) return 16;

    const birthDate = dayjs(dateString, ["YYYY-MM-DD", "DD/MM/YYYY"], true);
    if (!birthDate.isValid()) return 0;

    const today = dayjs();
    let age = today.year() - birthDate.year();

    if (
      today.month() < birthDate.month() ||
      (today.month() === birthDate.month() && today.date() < birthDate.date())
    ) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (value) {
      const parsed = dayjs(value, [
        "YYYY-MM-DDTHH:mm:ss.SSSZ",
        "YYYY-MM-DD",
        "DD/MM/YYYY"
      ], false);

      if (parsed.isValid()) {
        setDateValue(parsed.format("YYYY-MM-DD"));
        setDisplayValue(parsed.format("DD/MM/YYYY"));
      } else {
        setDateValue("");
        setDisplayValue("");
      }
    }
  }, [value]);

  const handleInputChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 8) value = value.slice(0, 8);

    let formattedValue = "";
    for (let i = 0; i < value.length; i++) {
      if (i === 2 || i === 4) formattedValue += "/";
      formattedValue += value[i];
    }

    setDisplayValue(formattedValue);

    if (formattedValue.length === 10) {
      const parsedDate = dayjs(formattedValue, "DD/MM/YYYY", true);
      if (parsedDate.isValid()) {
        const isoDate = parsedDate.format("YYYY-MM-DD");
        setDateValue(isoDate);

        const age = validateAge(isoDate);
        if (age < 16 && !disableAgeValidation) {
          setError("You must be 16 years or older to proceed");
        } else {
          setError("");
        }

        if (onChange) {
          onChange({
            target: {
              name,
              value: parsedDate.toISOString(),
            },
          });
        }
      } else {
        setError("Invalid Date");
      }
    } else {
      setDateValue("");
      setError("");
      if (onChange) {
        onChange({
          target: {
            name,
            value: "",
          },
        });
      }
    }
  };

  const handleCalendarChange = (date) => {
    if (date) {
      const isoDate = date.format("YYYY-MM-DD");
      setDateValue(isoDate);
      setDisplayValue(date.format("DD/MM/YYYY"));

      const age = validateAge(isoDate);
      if (age < 16 && !disableAgeValidation) {
        setError("You must be 16 years or older to proceed");
      } else {
        setError("");
      }

      if (onChange) {
        onChange({
          target: {
            name,
            value: date.toISOString(),
          },
        });
      }
    } else {
      setDateValue("");
      setDisplayValue("");
      setError("");
    }
    setIsCalendarOpen(false);
  };

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
          {isEmpty && <span className="ml-1 text-xs font-normal lowercase text-red-500">(Required)</span>}
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
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors
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
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

export default DatePicker;
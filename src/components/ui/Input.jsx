import React from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export const Input = React.forwardRef(
  (
    {
      label,
      name,
      required = false,
      type = 'text',
      readOnly = false,
      multiline = false,
      className = '',
      value = '',
      showValidation = false,
      onChange,
      ...props
    },
    ref,
  ) => {
    const isEmpty = required && !value && showValidation;
    const hasValue = value && value.toString().length > 0;

    const handleClear = e => {
      e.preventDefault();
      e.stopPropagation();
      if (onChange) {
        const syntheticEvent = {
          target: {
            name: name,
            value: '',
            type: type,
          },
        };
        onChange(syntheticEvent);
      }
    };

    const fieldStateClasses = (() => {
      if (props.disabled) {
        return 'bg-slate-100/80 border-slate-200 text-slate-700 cursor-not-allowed';
      }
      if (readOnly) {
        return 'bg-slate-50 border-slate-200 text-slate-700 cursor-default focus:ring-0 focus:border-slate-200';
      }
      if (isEmpty) {
        return 'bg-red-50/60 border-red-400 text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/15';
      }
      return 'bg-white border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 text-slate-900 shadow-sm';
    })();

    const focusClasses =
      readOnly || props.disabled
        ? 'focus:outline-none focus:ring-0'
        : 'focus:outline-none transition-all duration-200';

    const inputClasses = `
    w-full px-3.5 py-2.5 text-sm rounded-xl border
    ${fieldStateClasses}
    ${focusClasses}
    ${className}
  `;

    const labelClasses = `
    mb-1.5 text-xs font-semibold tracking-tight uppercase text-slate-600
    ${isEmpty ? 'text-red-600' : ''}
  `;

    if (multiline) {
      return (
        <div className="flex flex-col">
          {label && (
            <label htmlFor={name} className={labelClasses}>
              {label} {required && <span className="text-red-500">*</span>}
              {isEmpty && (
                <span className="ml-1 text-xs font-normal lowercase text-red-500">
                  (Required)
                </span>
              )}
            </label>
          )}
          <div className="relative">
            <textarea
              ref={ref}
              id={name}
              name={name}
              readOnly={readOnly}
              className={inputClasses}
              rows={4}
              value={value}
              onChange={onChange}
              {...props}
            />
            {hasValue && !readOnly && !props.disabled && !isEmpty && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors duration-150 focus:outline-none"
                title="Clear field">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {isEmpty && (
              <div className="absolute right-3 top-3 text-red-500">
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
            {isEmpty && (
              <span className="ml-1 text-xs font-normal lowercase text-red-500">
                (Required)
              </span>
            )}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={type}
            id={name}
            name={name}
            readOnly={readOnly}
            className={inputClasses}
            value={value}
            onChange={onChange}
            {...props}
          />
          {hasValue && !readOnly && !props.disabled && !isEmpty && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-150 focus:outline-none"
              title="Clear field">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          {isEmpty && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500">
              <ExclamationCircleOutlined />
            </div>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
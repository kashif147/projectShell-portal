import React from 'react';
import {
  clampOptionQuantity,
  formatRegistrationPrice,
  getOptionQuantity,
} from '../../helpers/events.helper';

const QuantityStepper = ({ value, min = 0, onChange, ariaLabel, disabled = false }) => {
  const canDecrement = !disabled && value > min;
  const canIncrement = !disabled;

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        aria-label={`Decrease ${ariaLabel}`}
        disabled={!canDecrement}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={`flex h-9 w-9 items-center justify-center rounded-md border text-lg font-semibold transition ${
          canDecrement
            ? 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
            : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300'
        }`}>
        −
      </button>
      <span className="min-w-[2rem] text-center text-base font-semibold text-slate-900">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Increase ${ariaLabel}`}
        disabled={!canIncrement}
        onClick={() => onChange(value + 1)}
        className={`flex h-9 w-9 items-center justify-center rounded-md border text-lg font-semibold transition ${
          canIncrement
            ? 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
            : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300'
        }`}>
        +
      </button>
    </div>
  );
};

const RegistrationPricingOptions = ({
  options = [],
  quantities = {},
  onQuantityChange,
  entityLabel = 'event',
}) => {
  if (!options.length) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        No pricing options are available for this {entityLabel}.
      </p>
    );
  }

  return (
    <div className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {options.map(option => {
        const selectable = option.selectable !== false;
        const quantity = selectable ? getOptionQuantity(quantities, option) : 0;
        const min = 0;

        return (
          <div
            key={option.id}
            className={`flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5 ${
              selectable ? '' : 'bg-slate-50'
            }`}>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-semibold sm:text-base ${
                  selectable ? 'text-slate-900' : 'text-slate-500'
                }`}>
                {option.title}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {formatRegistrationPrice(option.unitPrice)}
                {option.isGroup ? ' per student' : ''}
              </p>
              {option.subtitle ? (
                <p className="mt-1 text-xs text-slate-400">{option.subtitle}</p>
              ) : null}
              {option.isGroup && option.minGroupSize ? (
                <p className="mt-1 text-xs text-slate-400">
                  Min {option.minGroupSize} students
                </p>
              ) : null}
            </div>

            {selectable ? (
              <QuantityStepper
                value={quantity}
                min={min}
                ariaLabel={option.title}
                onChange={next => {
                  let resolved = next;
                  if (
                    option.isGroup &&
                    next > 0 &&
                    next < (option.minGroupSize || 1)
                  ) {
                    resolved = quantity === 0 ? option.minGroupSize || 1 : 0;
                  }
                  onQuantityChange?.(
                    option.id,
                    clampOptionQuantity(option, resolved),
                  );
                }}
              />
            ) : (
              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500">
                Members only
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RegistrationPricingOptions;

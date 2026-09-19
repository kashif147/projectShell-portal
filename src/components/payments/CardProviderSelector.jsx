import React from 'react';
import { CARD_PROVIDERS } from '../../constants/paymentProviders';

const OPTIONS = [
  {
    value: CARD_PROVIDERS.STRIPE,
    label: 'Stripe',
    description: 'Pay with card via Stripe',
  },
  {
    value: CARD_PROVIDERS.GLOBAL_PAYMENTS,
    label: 'Global Payments',
    description: 'Pay with card via Global Payments',
  },
];

/**
 * Radio/tabs selector for card gateways (testing: both visible).
 */
const CardProviderSelector = ({
  value,
  onChange,
  providers = [CARD_PROVIDERS.STRIPE, CARD_PROVIDERS.GLOBAL_PAYMENTS],
  disabled = false,
  className = '',
}) => {
  const visible = OPTIONS.filter(opt => providers.includes(opt.value));

  if (visible.length <= 1) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-xs font-semibold text-gray-700">Card payment provider</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {visible.map(opt => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(opt.value)}
              className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
                selected
                  ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <span className="block text-sm font-semibold text-gray-900">
                {opt.label}
              </span>
              <span className="block text-[11px] text-gray-500 mt-0.5">
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CardProviderSelector;

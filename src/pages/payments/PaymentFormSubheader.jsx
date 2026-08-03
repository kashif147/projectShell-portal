import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFormSubheader = ({ title, subtitle, showBack = true }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto">
        {showBack && (
          <div className="flex items-center gap-3 py-3 border-b border-gray-100 min-h-[52px]">
            <button
              type="button"
              onClick={() => navigate('/payments/method')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Back to payment methods">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500">Payment Method</p>
              <p className="text-sm text-gray-700 truncate">
                Select your preferred payment method
              </p>
            </div>
          </div>
        )}
        <div className="py-3 sm:py-3.5 min-h-[52px] flex flex-col justify-center">
          <h1 className="text-sm sm:text-base font-semibold text-gray-900 leading-tight truncate">
            {title}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFormSubheader;

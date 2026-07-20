import React from 'react';

const PaymentsBillingCard = ({
  membershipNumber,
  accountNetBalance,
  accountNetBalanceLoading,
  formatCurrency,
  payDisabled,
  onPay,
}) => {
  const net = accountNetBalance?.net;
  const isCredit = typeof net === 'number' && net < 0;
  const displayAmount = formatCurrency(
    isCredit ? Math.abs(net) : net ?? 0,
  );

  return (
    <div className="section-card">
      <h2 className="mb-4 text-xl font-extrabold tracking-tight text-slate-900">
        Payments & Billing
      </h2>
      <div className="space-y-2.5 sm:space-y-4">
        {membershipNumber && (
          <div className="rounded-lg bg-slate-50 p-3 sm:p-4">
            <p className="mb-1 text-sm font-semibold text-slate-900 sm:text-sm sm:font-normal sm:text-slate-600 sm:text-right">
              Net Balance
              {accountNetBalance?.year && (
                <span className="ml-1">({accountNetBalance.year})</span>
              )}
            </p>
            {accountNetBalanceLoading ? (
              <p className="animate-pulse text-xl font-bold text-slate-500 sm:text-3xl sm:text-right">
                Loading...
              </p>
            ) : (
              <p
                className={`text-xl font-bold sm:text-3xl sm:text-right ${
                  isCredit ? 'text-green-600' : 'text-red-600'
                }`}>
                {displayAmount}
              </p>
            )}

            <div className="mt-3 flex items-center gap-2 sm:hidden">
              <div className="flex-1 rounded-lg bg-slate-200 px-2.5 py-1.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                  Membership No
                </p>
                <p className="mt-0.5 text-lg font-bold leading-none text-slate-900">
                  {membershipNumber}
                </p>
              </div>
              <button
                onClick={onPay}
                disabled={payDisabled}
                className={`min-w-[96px] rounded-lg px-3 py-1.5 text-base font-semibold transition-colors ${
                  payDisabled
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                Pay Now
              </button>
            </div>
          </div>
        )}
        <button
          onClick={onPay}
          disabled={payDisabled}
          className={`hidden sm:block w-full px-4 py-2.5 sm:py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm sm:text-base ${
            payDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}>
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default PaymentsBillingCard;

import React from 'react';
import { CreditCardOutlined, ArrowRightOutlined } from '@ant-design/icons';

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
    <div className="section-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CreditCardOutlined />
            </span>
            Payments & Billing
          </h2>
          {membershipNumber && (
            <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              ID: {membershipNumber}
            </span>
          )}
        </div>

        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/80 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Net Balance
              {accountNetBalance?.year && (
                <span className="ml-1 text-slate-400">({accountNetBalance.year})</span>
              )}
            </p>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {isCredit ? 'Credit' : 'Due'}
            </span>
          </div>

          <div className="mt-2">
            {accountNetBalanceLoading ? (
              <div className="h-9 w-32 bg-slate-200 animate-pulse rounded-lg" />
            ) : (
              <p
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isCredit ? 'text-emerald-600' : 'text-slate-900'
                }`}>
                {displayAmount}
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 sm:hidden">
            {membershipNumber && (
              <div className="flex-1 rounded-lg bg-white border border-slate-200 px-3 py-1.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Member No
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {membershipNumber}
                </p>
              </div>
            )}
            <button
              onClick={onPay}
              disabled={payDisabled}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-all shadow-sm ${
                payDisabled
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-500/20'
              }`}>
              Pay Now
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={onPay}
        disabled={payDisabled}
        className={`hidden sm:flex items-center justify-center gap-2 mt-4 w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
          payDisabled
            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20 active:scale-[0.99]'
        }`}>
        <span>Pay Balance</span>
        <ArrowRightOutlined className="text-xs" />
      </button>
    </div>
  );
};

export default PaymentsBillingCard;

// Plain React (no JSX, no app context) so it renders standalone and in node tests.
import React from 'react';
import { PAYMENT_RETURN_COPY } from './paymentReturn.js';

const h = React.createElement;

/** Static, presentation-only return page. Props: outcome ('success' | 'cancel'), logoSrc. */
export function PaymentReturnPage({ outcome, logoSrc }) {
  const copy = PAYMENT_RETURN_COPY[outcome] || PAYMENT_RETURN_COPY.cancel;
  return h(
    'main',
    { className: 'min-h-screen flex items-center justify-center p-6 text-center bg-slate-50', 'data-payment-return': outcome },
    h(
      'div',
      { className: 'max-w-md w-full rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-5' },
      logoSrc ? h('img', { src: logoSrc, alt: 'Portal', className: 'h-12 mx-auto' }) : null,
      h('h1', { className: 'text-xl font-bold text-slate-900 font-poppins' }, copy.title),
      h('p', { className: 'text-sm text-slate-500 leading-relaxed' }, copy.message),
      h(
        'a',
        { href: '/', className: 'inline-block w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700' },
        'Go to the portal',
      ),
    ),
  );
}

// Public Stripe Checkout return pages (/payments/success, /payments/cancel).
// Presentation only: the payer may arrive from an emailed payment link with no portal session,
// so these pages render before (and instead of) the portal app - no sign-in handling, no API
// client, no tenant. They never read the query string: Stripe parameters (session ids etc.)
// are not proof of payment and are never rendered. The backend (Stripe webhooks) is
// authoritative for the payment and application state.

export const PAYMENT_RETURN_PATHS = Object.freeze({
  '/payments/success': 'success',
  '/payments/cancel': 'cancel',
});

export const PAYMENT_RETURN_COPY = Object.freeze({
  success: Object.freeze({
    title: 'Payment submitted',
    message:
      'Your payment has been submitted. We are confirming the payment status. You can close this page.',
  }),
  cancel: Object.freeze({
    title: 'Payment not completed',
    message:
      'The payment was not completed. You can return to the payment link and try again if it is still valid.',
  }),
});

/** 'success' | 'cancel' for exactly the two return paths (one trailing slash tolerated), else null. */
export function paymentReturnOutcome(pathname) {
  if (typeof pathname !== 'string') return null;
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  return Object.prototype.hasOwnProperty.call(PAYMENT_RETURN_PATHS, path)
    ? PAYMENT_RETURN_PATHS[path]
    : null;
}

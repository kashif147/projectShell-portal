// Entry point. The public Stripe Checkout return pages render standalone (see
// src/paymentReturn/); every other path loads the portal app unchanged (src/app.jsx).
import { paymentReturnOutcome } from './paymentReturn/paymentReturn.js';

const paymentReturn = paymentReturnOutcome(window.location.pathname);

if (paymentReturn) {
  import('./paymentReturn/boot.js').then(({ renderPaymentReturn }) => renderPaymentReturn(paymentReturn));
} else {
  import('./app.jsx');
}

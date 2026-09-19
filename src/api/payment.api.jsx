import payment_request from './payment_request';

/**
 * Stripe PaymentIntent (existing).
 * POST /api/payments/intents
 */
export const createPaymentIntentRequest = data => {
  return payment_request.post('/api/payments/intents', data);
};

/**
 * Global Payments — mint a short-lived Hosted Fields access token.
 *
 * Backend (account-service) contract:
 *   POST /api/payments/global/access-token
 *   Auth: same as payment intents (Bearer member token).
 *   Uses server-only GP_APP_ID / GP_APP_KEY; never returns app_key.
 *
 * Expected response:
 *   {
 *     success: true,
 *     data: { accessToken, env: 'sandbox'|'qa'|'production', expiresAt? }
 *   }
 */
export const createGlobalPaymentsAccessTokenRequest = (data = {}) => {
  return payment_request.post('/api/payments/global/access-token', data);
};

/**
 * Global Payments — charge a tokenized card (payment_reference from Hosted Fields).
 *
 * Backend (account-service) contract:
 *   POST /api/payments/global/charge
 *   Body: {
 *     paymentReference, amount (minor units), currency,
 *     purpose, applicationId?, eventId?, metadata?
 *   }
 *
 * Expected response:
 *   {
 *     success: true,
 *     data: { transactionId, status, provider: 'GLOBAL_PAYMENTS' }
 *   }
 *
 * Optional later: webhook / status endpoint mirroring Stripe confirmations for 3DS.
 */
export const chargeGlobalPaymentsRequest = data => {
  return payment_request.post('/api/payments/global/charge', data);
};

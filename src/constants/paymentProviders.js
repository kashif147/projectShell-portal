/**
 * Card payment providers available in the portal.
 * Secrets (GP app_id / app_key) stay on account-service only.
 */

export const CARD_PROVIDERS = {
  STRIPE: 'STRIPE',
  GLOBAL_PAYMENTS: 'GLOBAL_PAYMENTS',
};

/**
 * Testing flag: show Stripe and Global Payments side-by-side.
 * Later replace with CRM-selected provider via resolveCardProvider.
 */
export const SHOW_BOTH_CARD_PROVIDERS = true;

/**
 * Resolve which card provider(s) to show.
 *
 * @param {object} options
 * @param {string|null} [options.crmProvider] - Future CRM value: 'STRIPE' | 'GLOBAL_PAYMENTS'
 * @param {boolean} [options.testingShowBoth] - Override for local testing (defaults to SHOW_BOTH_CARD_PROVIDERS)
 * @returns {{ mode: 'both' | 'single', provider: string|null, providers: string[] }}
 */
export const resolveCardProvider = ({
  crmProvider = null,
  testingShowBoth = SHOW_BOTH_CARD_PROVIDERS,
} = {}) => {
  if (testingShowBoth) {
    return {
      mode: 'both',
      provider: null,
      providers: [CARD_PROVIDERS.STRIPE, CARD_PROVIDERS.GLOBAL_PAYMENTS],
    };
  }

  const normalized = String(crmProvider || CARD_PROVIDERS.STRIPE).toUpperCase();
  const provider =
    normalized === CARD_PROVIDERS.GLOBAL_PAYMENTS
      ? CARD_PROVIDERS.GLOBAL_PAYMENTS
      : CARD_PROVIDERS.STRIPE;

  return {
    mode: 'single',
    provider,
    providers: [provider],
  };
};

export const shouldShowProviderSelector = (resolution = resolveCardProvider()) =>
  resolution.mode === 'both' && resolution.providers.length > 1;

export const getDefaultCardProvider = (resolution = resolveCardProvider()) => {
  if (resolution.mode === 'single' && resolution.provider) {
    return resolution.provider;
  }
  return CARD_PROVIDERS.STRIPE;
};

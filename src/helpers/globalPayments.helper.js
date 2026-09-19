const GP_SCRIPT_SRC = 'https://js.globalpay.com/5.1.3/globalpayments.js';

let scriptLoadPromise = null;

/**
 * Load GlobalPayments from CDN (npm package only ships TypeScript types).
 * @returns {Promise<object>} GlobalPayments global
 */
export const loadGlobalPaymentsSdk = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Global Payments SDK requires a browser'));
  }

  if (window.GlobalPayments) {
    return Promise.resolve(window.GlobalPayments);
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GP_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.GlobalPayments) resolve(window.GlobalPayments);
        else reject(new Error('Global Payments SDK failed to initialize'));
      });
      existing.addEventListener('error', () => {
        scriptLoadPromise = null;
        reject(new Error('Failed to load Global Payments SDK'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = GP_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      if (window.GlobalPayments) {
        resolve(window.GlobalPayments);
      } else {
        scriptLoadPromise = null;
        reject(new Error('Global Payments SDK failed to initialize'));
      }
    };
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error('Failed to load Global Payments SDK'));
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
};

export const extractAccessTokenPayload = response => {
  const data = response?.data?.data || response?.data || {};
  const accessToken =
    data.accessToken || data.access_token || data.token || null;
  const env = data.env || data.environment || 'sandbox';
  return { accessToken, env, raw: data };
};

export const extractChargePayload = response => {
  const data = response?.data?.data || response?.data || {};
  return {
    transactionId:
      data.transactionId || data.transaction_id || data.id || null,
    status: data.status || null,
    provider: data.provider || 'GLOBAL_PAYMENTS',
    raw: data,
  };
};

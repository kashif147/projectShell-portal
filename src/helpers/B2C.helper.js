import { generatePkceRequest } from '../api/auth.api';
import {
  clearB2CAuthTransaction,
  setB2CAuthTransaction,
} from './verifier.helper';

export const B2C_FLOW_STORAGE_KEY = 'azure_b2c_flow';

/** Map UI intent → /pkce/generate ?flow= and authorizationUrls key. */
const FLOW_BY_INTENT = {
  signin: 'signin',
  signup: 'signup',
  gmail: 'gmail',
  'password-reset': 'password-reset',
  default: 'signin',
};

const AUTHORIZATION_URL_KEY_BY_FLOW = {
  signin: 'azureB2CSignIn',
  signup: 'azureB2CSignUp',
  gmail: 'azureB2CGmailCombined',
  'password-reset': 'azureB2CPasswordReset',
  default: 'azureB2C',
};

export const pickB2CAuthorizationUrl = (payload, flow = 'signin') => {
  const urls = payload?.authorizationUrls || {};
  const key =
    AUTHORIZATION_URL_KEY_BY_FLOW[flow] || AUTHORIZATION_URL_KEY_BY_FLOW.default;
  return (
    urls[key] ||
    urls.azureB2C ||
    payload?.authorizationUrl ||
    null
  );
};

export const extractOAuthParam = (urlString, paramName) => {
  if (!urlString || !paramName) return null;
  try {
    const parsed = new URL(urlString);
    const value = parsed.searchParams.get(paramName);
    if (value) return value;
  } catch {
    // Custom schemes / partial URLs — fall through to regex.
  }
  const match = String(urlString).match(
    new RegExp(`[?&#]${paramName}=([^&#]+)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Start B2C login via backend PKCE.
 * Uses the exact authorization URL returned by GET /pkce/generate.
 * Does not build Microsoft authorize URLs, state, or nonce on the client.
 */
export const microSoftUrlRedirect = async (intent = 'signin') => {
  const flow = FLOW_BY_INTENT[intent] || FLOW_BY_INTENT.default;

  if (
    flow === 'signin' ||
    flow === 'signup' ||
    flow === 'gmail' ||
    flow === 'password-reset'
  ) {
    sessionStorage.setItem(B2C_FLOW_STORAGE_KEY, flow);
  } else {
    sessionStorage.removeItem(B2C_FLOW_STORAGE_KEY);
  }

  const response = await generatePkceRequest(flow);
  const payload = response?.data;

  if (!(response?.status >= 200 && response?.status < 300) || !payload) {
    clearB2CAuthTransaction();
    throw new Error(
      payload?.message ||
        payload?.error ||
        'Failed to start authentication. Please try again.',
    );
  }

  const codeVerifier = payload.codeVerifier;
  const authUrl = pickB2CAuthorizationUrl(payload, flow);

  if (!codeVerifier || !authUrl) {
    clearB2CAuthTransaction();
    throw new Error('Authentication challenge was incomplete. Please try again.');
  }

  // Prefer state embedded in the URL actually used for this flow.
  const stateFromUrl = extractOAuthParam(authUrl, 'state');
  const state = stateFromUrl || payload.state || null;

  if (!state) {
    clearB2CAuthTransaction();
    throw new Error('Authentication state was missing. Please try again.');
  }

  setB2CAuthTransaction({ codeVerifier, state });

  window.location.href = authUrl;
};

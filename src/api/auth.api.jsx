import request from './request';

/**
 * Start a B2C auth transaction.
 * @param {string} [flow] signin | signup | password-reset | gmail
 */
export const generatePkceRequest = (flow) => {
  const config = flow ? { params: { flow } } : {};
  return request.get('/pkce/generate', config);
};

export const signInMicrosoftRequest = data => {
  return request.post('/auth/azure-portal', data);
};

export const validationRequest = () => {
  return request.get('/api/me');
};

export const refreshTokenRequest = (data) => {
  return request.post('/auth/refresh', data);
};

/**
 * Front-channel logout URLs (Azure AD + B2C) - see user-service's pkce.controller.js's
 * getLogoutUrls for why these are needed (clearing our own token doesn't end Microsoft's
 * own session cookie) and why no auth is required for this call.
 */
export const getLogoutUrlsRequest = () => {
  return request.get('/pkce/logout-urls');
};
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
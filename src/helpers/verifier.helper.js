const CODE_VERIFIER_KEY = 'azure_b2c_code_verifier';
const STATE_KEY = 'azure_b2c_state';

const storage = () =>
  typeof sessionStorage !== 'undefined' ? sessionStorage : localStorage;

/** @deprecated Prefer setB2CAuthTransaction — kept for call-site compatibility. */
export const setVerifier = verifier => {
  storage().setItem(CODE_VERIFIER_KEY, verifier);
};

export const getVerifier = () => storage().getItem(CODE_VERIFIER_KEY);

export const deleteVerifier = () => {
  storage().removeItem(CODE_VERIFIER_KEY);
};

export const setB2CState = state => {
  if (state) storage().setItem(STATE_KEY, state);
};

export const getB2CState = () => storage().getItem(STATE_KEY);

export const deleteB2CState = () => {
  storage().removeItem(STATE_KEY);
};

export const setB2CAuthTransaction = ({ codeVerifier, state } = {}) => {
  if (codeVerifier) setVerifier(codeVerifier);
  if (state) setB2CState(state);
};

export const getB2CAuthTransaction = () => ({
  codeVerifier: getVerifier(),
  state: getB2CState(),
});

export const clearB2CAuthTransaction = () => {
  deleteVerifier();
  deleteB2CState();
  try {
    // Legacy key from pre-hardening client PKCE.
    storage().removeItem('code_verifier');
    localStorage.removeItem('code_verifier');
  } catch {
    // ignore
  }
};

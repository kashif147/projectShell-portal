const base64UrlEncode = (buffer) =>
  btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

export const generatePKCE = async () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  const code_verifier = base64UrlEncode(array);

  const encoder = new TextEncoder();
  const data = encoder.encode(code_verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  const code_challenge = base64UrlEncode(new Uint8Array(digest));

  return { code_verifier, code_challenge }
};

// decryptToken (AES-256-GCM keyed off VITE_JWT_SECRET) used to live here. Removed: the
// backend now sends tokens as the signed JWT itself, not "iv:tag:data" ciphertext, and
// having the browser decrypt them required shipping JWT_SECRET - the gateway's own
// token-signing key - in this app's public bundle. The JWT's signature (checked
// server-side, not by anything here) already protects it from tampering; see
// user-service's azure.ad.controller.js and b2c.users.controller.js for the backend side
// of this change.
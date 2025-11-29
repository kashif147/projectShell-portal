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

export async function decryptToken(encryptedToken) {
  const parts = encryptedToken.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }
  
  const [ivBase64, authTagBase64, encrypted] = parts;
  const JWT_SECRET = import.meta.env.VITE_JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
  const authTag = Uint8Array.from(atob(authTagBase64), c => c.charCodeAt(0));
  const encryptedData = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  
  const encoder = new TextEncoder();
  const secretBuffer = encoder.encode(JWT_SECRET);
  const saltBuffer = await window.crypto.subtle.digest('SHA-256', secretBuffer);
  const salt = new Uint8Array(saltBuffer).slice(0, 64);
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    secretBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['decrypt']
  );
  
  const ciphertext = new Uint8Array(encryptedData.length + authTag.length);
  ciphertext.set(encryptedData);
  ciphertext.set(authTag, encryptedData.length);
  
  try {
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
      derivedKey,
      ciphertext
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}
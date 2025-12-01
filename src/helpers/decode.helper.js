import { jwtDecode } from 'jwt-decode';
import { getHeaders } from './auth.helper';
import { decryptToken } from './crypt.helper';

export const decryptHelper = async (encryptedToken) => {
  try {
    if (encryptedToken && encryptedToken.includes(':')) {
      const decrypted = await decryptToken(encryptedToken);
      return decrypted;
    }
    return encryptedToken;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

export const getMemberDetail = async () => {
  const res = getHeaders();
  if (res?.token) {
    // Remove "Bearer " if included
    let cleanToken = res.token.replace(/^Bearer\s+/i, '');

    // Decrypt token if it's encrypted
    if (cleanToken && cleanToken.includes(':')) {
      try {
        cleanToken = await decryptHelper(cleanToken);
        if (!cleanToken) {
          return null;
        }
      } catch (error) {
        console.error('Token decryption failed:', error);
        return null;
      }
    }

    try {
      const decoded = jwtDecode(cleanToken); // Decode JWT payload
      return decoded; // Contains user info (e.g., id, email, roles, exp)
    } catch (error) {
      console.error('Invalid JWT token:', error);
      return null;
    }
  }
  return null;
};

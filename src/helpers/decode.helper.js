import { jwtDecode } from 'jwt-decode';
import { getHeaders } from './auth.helper';

// The backend now sends the signed JWT as-is (no client-side decryption) - see
// helpers/crypt.helper.js.
export const getMemberDetail = async () => {
  const res = getHeaders();
  if (res?.token) {
    // Remove "Bearer " if included
    const cleanToken = res.token.replace(/^Bearer\s+/i, '');

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

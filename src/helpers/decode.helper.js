import { jwtDecode } from 'jwt-decode';
import { getHeaders } from './auth.helper';

export const getMemberDetail = () => {
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

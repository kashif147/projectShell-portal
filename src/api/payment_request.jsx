/* eslint-disable dot-notation */
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';   // 👈 import UUID
import { getHeaders } from '../helpers/auth.helper';
import { decryptToken } from '../helpers/crypt.helper';
import { ACCOUNT_URL } from '../constants/api';

const payment_request = axios.create();

payment_request.interceptors.request.use(
  async config => {
    const headers = getHeaders();
    let token = headers.token;

    if (!token) {
      console.error('No token found in localStorage');
      return Promise.reject(new Error('Authentication token not found'));
    }
    
    // Decrypt token if it exists and appears to be encrypted (contains colons)
    if (token && token.includes(':')) {
      try {
        token = await decryptToken(token);
      } catch (error) {
        console.error('Token decryption failed:', error);
        // Continue with original token if decryption fails
      }
    }

    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';
    config.headers['x-idempotency-key'] = uuidv4(); // 👈 auto-generate unique key each request
    config.baseURL = ACCOUNT_URL;

    return config;
  },
  error => Promise.reject(error),
);

payment_request.interceptors.response.use(
  res => res,
  error => {
    console.error('Payment request error:', error);
    return Promise.reject(error);
  },
);

export default payment_request;

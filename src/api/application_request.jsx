/* eslint-disable dot-notation */
import axios from 'axios';
import { getHeaders } from '../helpers/auth.helper';
import { decryptToken } from '../helpers/crypt.helper';
import { PORTAL_URL } from '../constants/api';

const application_request = axios.create();

application_request.interceptors.request.use(
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

    config.baseURL = PORTAL_URL;

    return config;
  },
  error => {
    Promise.reject(error);
  },
);

application_request.interceptors.response.use(
  res => {
    return res;
  },
  error => {
    return error.response;
  },
);

export default application_request;

/* eslint-disable dot-notation */
import axios from 'axios';
import { getHeaders } from '../helpers/auth.helper';
import { decryptToken } from '../helpers/crypt.helper';
import { PROFILE_URL } from '../constants/api';

const profile_request = axios.create();

profile_request.interceptors.request.use(
  async config => {
    const headers = getHeaders();
    let token = headers.token;
    if (!token) {
      console.error('No token found in localStorage');
      return Promise.reject(new Error('Authentication token not found'));
    }
    
    if (token && token.includes(':')) {
      try {
        token = await decryptToken(token);
      } catch (error) {
        console.error('Token decryption failed:', error);
      }
    }
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';

    config.baseURL = PROFILE_URL;

    return config;
  },
  error => {
    Promise.reject(error);
  },
);

profile_request.interceptors.response.use(
  res => {
    return res;
  },
  error => {
    return error.response;
  },
);

export default profile_request;

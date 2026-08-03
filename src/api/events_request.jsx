/* eslint-disable dot-notation */
import axios from 'axios';
import { getHeaders } from '../helpers/auth.helper';
import { decryptToken } from '../helpers/crypt.helper';
import { EVENTS_URL } from '../constants/api';

const events_request = axios.create();

events_request.interceptors.request.use(
  async config => {
    const headers = getHeaders();
    let token = headers.token;

    if (token && token.includes(':')) {
      try {
        token = await decryptToken(token);
      } catch (error) {
        console.error('Token decryption failed:', error);
      }
    }

    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';
    config.baseURL = EVENTS_URL;

    return config;
  },
  error => Promise.reject(error),
);

events_request.interceptors.response.use(
  res => res,
  error => error.response,
);

export default events_request;

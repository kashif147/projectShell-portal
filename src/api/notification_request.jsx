/* eslint-disable dot-notation */
import axios from 'axios';
import { getHeaders } from '../helpers/auth.helper';
import { NOTIFICATION_URL } from '../constants/api';

const notification_request = axios.create();

notification_request.interceptors.request.use(
  async config => {
    const headers = getHeaders();
    const token = headers.token;

    if (!token) {
      console.error('No token found in localStorage');
      return Promise.reject(new Error('Authentication token not found'));
    }
    // The backend now sends the signed JWT as-is (no client-side decryption) - see
    // helpers/crypt.helper.js.
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';

    config.baseURL = NOTIFICATION_URL;

    return config;
  },
  error => {
    Promise.reject(error);
  },
);

notification_request.interceptors.response.use(
  res => {
    return res;
  },
  error => {
    return error.response;
  },
);

export default notification_request;

/* eslint-disable dot-notation */
import axios from 'axios';
import { getHeaders } from '../helpers/auth.helper';
import { PROFILE_URL } from '../constants/api';

const profile_request = axios.create();

profile_request.interceptors.request.use(
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

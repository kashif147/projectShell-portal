/* eslint-disable dot-notation */
import axios from 'axios';
import { getHeaders } from '../helpers/auth.helper';
import { BASE_URL } from '../constants/api';

const request = axios.create();

request.interceptors.request.use(
  async config => {
    const headers = getHeaders();
    // The backend now sends the signed JWT as-is (no client-side decryption) - see
    // helpers/crypt.helper.js.
    const token = headers.token;
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';

    config.baseURL = BASE_URL;

    return config;
  },
  error => {
    Promise.reject(error);
  },
);

request.interceptors.response.use(
  res => {
    return res;
  },
  error => {
    return error.response;
  },
);

export default request;

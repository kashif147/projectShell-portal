/* eslint-disable dot-notation */
import axios from 'axios';
import { getHeaders } from '../helpers/auth.helper';
import { ACCOUNT_URL } from '../constants/api';

const acount_request = axios.create();

acount_request.interceptors.request.use(
  async config => {
    const headers = getHeaders();
    // The backend now sends the signed JWT as-is (no client-side decryption) - see
    // helpers/crypt.helper.js.
    const token = headers.token;
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';

    config.baseURL = ACCOUNT_URL;

    return config;
  },
  error => {
    Promise.reject(error);
  },
);

acount_request.interceptors.response.use(
  res => {
    return res;
  },
  error => {
    return error.response;
  },
);

export default acount_request;

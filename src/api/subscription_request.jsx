/* eslint-disable dot-notation */
import axios from 'axios';
import { getHeaders } from '../helpers/auth.helper';
import { decryptToken } from '../helpers/crypt.helper';
import { SUBSCRIPTION_URL } from '../constants/api';

const subscription_request = axios.create();

subscription_request.interceptors.request.use(
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
    console.log('token=============>', token);
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';

    config.baseURL = SUBSCRIPTION_URL;

    return config;
  },
  error => {
    Promise.reject(error);
  },
);

subscription_request.interceptors.response.use(
  res => {
    return res;
  },
  error => {
    return error.response;
  },
);

export default subscription_request;

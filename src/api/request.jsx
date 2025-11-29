/* eslint-disable dot-notation */
import axios from 'axios';
import { getHeaders } from '../helpers/auth.helper';
import { decryptToken } from '../helpers/crypt.helper';
import { BASE_URL } from '../constants/api';

const request = axios.create();

request.interceptors.request.use(
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

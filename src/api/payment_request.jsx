/* eslint-disable dot-notation */
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';   // 👈 import UUID
import { getHeaders } from '../helpers/auth.helper';
import { ACCOUNT_URL } from '../constants/api';

const payment_request = axios.create();

payment_request.interceptors.request.use(
  config => {
    const headers = getHeaders();

    config.headers['Authorization'] = `Bearer ${headers.token}`;
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

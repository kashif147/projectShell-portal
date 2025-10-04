/* eslint-disable dot-notation */
import axios from 'axios';
import { getHeaders } from '../helpers/auth.helper';
import { ACCOUNT_URL, } from '../constants/api';

const payment_request = axios.create();

payment_request.interceptors.request.use(
  config => {
    const headers = getHeaders();
    config.headers['Authorization'] = `Bearer ${headers.token}`;
    config.headers['Content-Type'] = 'application/json';
    config.headers['x-idempotency-key'] = `39866a06-30bc-4a89-80c6-9dd9357dd453:f0d5c1b6-e6c8-4fd9-b2cb-62aafe883bfa:2025-10-02T17:58:18.345`
    // Removed x-idempotency-key header due to CORS policy restrictions

    config.baseURL = ACCOUNT_URL;

    return config;
  },
  error => {
    Promise.reject(error);
  },
);

payment_request.interceptors.response.use(
  res => {
    return res;
  },
  error => {
    // Return the error response for proper error handling
    console.error('Payment request error:', error);
    return Promise.reject(error);
  },
);  

export default payment_request;

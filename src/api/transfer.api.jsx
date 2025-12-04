import transfer_request from './transfer_request';  

export const transferRequest = data => {
  return transfer_request.post('/api/transfer-request', data);
};

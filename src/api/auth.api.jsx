import request from './request';

export const signInMicrosoftRequest = data => {
  console.log('signInMicrosoftRequest data========>', data);
  return request.post('/auth/azure-portal', data);
};

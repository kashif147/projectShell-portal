import request from './request';

export const signInRequest = data => {
  return request.post('/auth', data);
};

export const signInMicrosoftRequest = data => {
  return request.post('/auth/microsoft', data);
};

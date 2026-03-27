export const setHeaders = headers => {
  localStorage.setItem('token', headers['accessToken']);
};

export const getHeaders = () => {
  return {
    token: localStorage.getItem('token'),
  };
};

export const deleteHeaders = () => {
  localStorage.removeItem('token');
};

export const setRefreshToken = refreshToken => {
  localStorage.setItem('refreshToken', refreshToken);
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

export const deleteRefreshToken = () => {
  localStorage.removeItem('refreshToken');
};

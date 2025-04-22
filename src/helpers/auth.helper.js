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

export const setHeaders = headers => {
  localStorage.setItem('token', headers['accessToken']);
};

export const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    token: token ? `Bearer ${token}` : null,
  };
};

export const deleteHeaders = () => {
  localStorage.removeItem('token');
};

export const saveUser = user => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  return {
    user: localStorage.getItem('user'),
  };
};

export const deleteUser = () => {
  localStorage.removeItem('user');
};

import api from './api';

export const registerUser = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

export const refreshToken = async () => {
  const token = localStorage.getItem('refreshToken');
  const response = await api.post('/api/auth/refresh', { refreshToken: token });
  return response.data;
};

export const logoutUser = async () => {
  try {
    await api.post('/api/auth/logout');
  } catch {}
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const getMe = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};
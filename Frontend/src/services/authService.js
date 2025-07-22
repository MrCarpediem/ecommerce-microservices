
import { proxyRequest, getToken } from './api';

export const registerUser = async (userData) => {
  return await proxyRequest('auth', 'register', 'POST', '/api/auth/register', userData);
};

export const loginUser = async (credentials) => {
  return await proxyRequest('auth', 'login', 'POST', '/api/auth/login', credentials);
};


export const getUserInfo = async () => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return await proxyRequest('auth', 'getUserInfo', 'GET', '/api/auth/user', null, token);
};


export const validateToken = async (token) => {
  if (!token) {
    return { valid: false };
  }
  
  try {
    const response = await proxyRequest('auth', 'validateToken', 'GET', '/api/auth/validate-token', null, token);
    return response;
  } catch (error) {
    console.error('Token validation failed:', error);
    return { valid: false };
  }
};


export const logoutUser = () => {
  localStorage.removeItem('token');
};

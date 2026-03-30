import axios from 'axios';
import { getServiceUrl } from './registryService';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const getUserServiceUrl = async () => {
  try {
    const service = await getServiceUrl('user');
    return service.url;
  } catch (error) {
    console.error('Failed to get user service URL:', error);
    throw new Error('User service unavailable');
  }
};

const UserService = {
  getUserProfile: async () => {
    try {
      const url = await getUserServiceUrl();
      const response = await api.get(`${url}/api/users/profile`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  updateUserProfile: async (profileData) => {
    try {
      const url = await getUserServiceUrl();
      const response = await api.put(`${url}/api/users/profile`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      const url = await getUserServiceUrl();
      const response = await api.get(`${url}/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  updatePreferences: async (preferences) => {
    try {
      const url = await getUserServiceUrl();
      const response = await api.put(`${url}/api/users/profile`, { preferences });
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  },

  updateAddress: async (address) => {
    try {
      const url = await getUserServiceUrl();
      const response = await api.put(`${url}/api/users/profile`, { address });
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  validateToken: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      const url = await getUserServiceUrl();
      await api.get(`${url}/api/users/profile`);
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default UserService;
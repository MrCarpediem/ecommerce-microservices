import axios from 'axios';

const API_URL = import.meta.env.VITE_REGISTRY_URL  || 'http://localhost:5002';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
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

const UserService = {
  getUserProfile: async () => {
    try {
      const response = await apiClient.get('/api/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  
  updateUserProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/api/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
  
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },
  
  updatePreferences: async (preferences) => {
    try {
      const response = await apiClient.put('/api/users/profile', { preferences });
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  },
  
  updateAddress: async (address) => {
    try {
      const response = await apiClient.put('/api/users/profile', { address });
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
      
      await apiClient.get('/api/users/profile');
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default UserService;
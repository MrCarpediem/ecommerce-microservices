import api from './api';

const UserService = {
  getProfile: async () => {
    const response = await api.get('/api/users/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/api/users/profile', data);
    return response.data;
  },

  addAddress: async (address) => {
    const response = await api.post('/api/users/addresses', address);
    return response.data;
  },

  removeAddress: async (addressId) => {
    const response = await api.delete(`/api/users/addresses/${addressId}`);
    return response.data;
  }
};

export default UserService;
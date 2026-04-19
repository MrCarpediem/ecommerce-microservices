import api from './api';

export const getUserOrders = async (params = {}) => {
  const response = await api.get('/api/orders', { params });
  return response.data.orders || [];
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/api/orders/${orderId}`);
  return response.data.order || response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post('/api/orders', orderData);
  return response.data.order || response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await api.patch(`/api/orders/${orderId}/cancel`);
  return response.data.order || response.data;
};

export const updateOrderStatus = async (orderId, orderStatus) => {
  const response = await api.patch(`/api/orders/${orderId}/status`, { orderStatus });
  return response.data.order || response.data;
};
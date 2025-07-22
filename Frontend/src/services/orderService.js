import axios from 'axios';
import { getServiceUrl } from './registryService';

const api = axios.create();

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (userId && config.method !== 'get') {
    config.data = { ...config.data, userId };
  }
  
  return config;
});

const getWithUserId = async (url, config = {}) => {
  const userId = localStorage.getItem('userId');
  return api.post(url, { userId }, config);
};

const getOrderServiceUrl = async () => {
  try {
    const service = await getServiceUrl('order');
    return service.url;
  } catch (error) {
    console.error('Failed to get order service URL:', error);
    throw new Error('Order service unavailable');
  }
};

export const getUserOrders = async () => {
  try {
    const serviceUrl = await getOrderServiceUrl();
    const response = await getWithUserId(`${serviceUrl}/api/orders`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error.response?.data?.error || 'Failed to fetch orders';
  }
};

export const getOrderById = async (orderId) => {
  try {
    const serviceUrl = await getOrderServiceUrl();
    const response = await getWithUserId(`${serviceUrl}/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error.response?.data?.error || 'Failed to fetch order details';
  }
};

export const createOrder = async (orderData) => {
  try {
    const serviceUrl = await getOrderServiceUrl();
    const userId = localStorage.getItem('userId');
    
    const orderWithUserId = {
      ...orderData,
      userId
    };
    
    const response = await api.post(`${serviceUrl}/api/orders`, orderWithUserId);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error.response?.data?.error || 'Failed to create order';
  }
};

export const updateOrderStatus = async (orderId, orderStatus) => {
  try {
    const serviceUrl = await getOrderServiceUrl();
    const response = await api.patch(
      `${serviceUrl}/api/orders/${orderId}/status`, 
      { orderStatus }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error.response?.data?.error || 'Failed to update order status';
  }
};

export const updatePaymentStatus = async (orderId, paymentStatus) => {
  try {
    const serviceUrl = await getOrderServiceUrl();
    const response = await api.patch(
      `${serviceUrl}/api/orders/${orderId}/payment`, 
      { paymentStatus }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error.response?.data?.error || 'Failed to update payment status';
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const serviceUrl = await getOrderServiceUrl();
    const response = await api.patch(`${serviceUrl}/api/orders/${orderId}/cancel`, {});
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error.response?.data?.error || 'Failed to cancel order';
  }
};
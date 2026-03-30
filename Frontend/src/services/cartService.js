import axios from 'axios';
import { getServiceUrl } from './registryService';

const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let CART_SERVICE_URL = null;

const initCartService = async () => {
  try {
    const cartService = await getServiceUrl('cart');
    CART_SERVICE_URL = cartService.url;
    return true;
  } catch (error) {
    console.error('Failed to initialize cart service:', error);
    return false;
  }
};

const ensureServiceUrl = async () => {
  if (!CART_SERVICE_URL) {
    await initCartService();
  }
  return !!CART_SERVICE_URL;
};

export const getUserCart = async () => {
  try {
    await ensureServiceUrl();
    const response = await api.post(`${CART_SERVICE_URL}/api/carts/get`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user cart:', error);
    throw error.response?.data?.message || 'Failed to fetch cart';
  }
};

export const addItemToCart = async (product) => {
  try {
    await ensureServiceUrl();
    const response = await api.post(`${CART_SERVICE_URL}/api/carts/items`, {
      productId: product._id,
      quantity: 1
    });
    return response.data;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error.response?.data?.message || 'Failed to add item to cart';
  }
};

export const updateCartItemQuantity = async (itemId, quantity) => {
  try {
    await ensureServiceUrl();
    const response = await api.put(`${CART_SERVICE_URL}/api/carts/items/${itemId}`, {
      quantity
    });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error.response?.data?.message || 'Failed to update cart item quantity';
  }
};

export const removeFromCart = async (itemId) => {
  try {
    await ensureServiceUrl();
    const response = await api.post(`${CART_SERVICE_URL}/api/carts/items/${itemId}/remove`);
    return response.data;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error.response?.data?.message || 'Failed to remove cart item';
  }
};

export const clearUserCart = async () => {
  try {
    await ensureServiceUrl();
    const response = await api.post(`${CART_SERVICE_URL}/api/carts/clear`);
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error.response?.data?.message || 'Failed to clear cart';
  }
};
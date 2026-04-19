import api from './api';

export const getUserCart = async () => {
  const response = await api.get('/api/cart');
  return response.data;
};

export const addItemToCart = async (productId, quantity = 1) => {
  const response = await api.post('/api/cart/items', { productId, quantity });
  return response.data;
};

export const updateCartItemQuantity = async (itemId, quantity) => {
  const response = await api.put(`/api/cart/items/${itemId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (itemId) => {
  const response = await api.delete(`/api/cart/items/${itemId}`);
  return response.data;
};

export const clearUserCart = async () => {
  const response = await api.delete('/api/cart');
  return response.data;
};
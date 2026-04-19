import api from './api';

const ProductService = {
  getProducts: async (filters = {}) => {
    const { category, sort, page = 1, limit = 10, search } = filters;
    const params = new URLSearchParams({ page, limit });
    if (category) params.append('category', category);
    if (sort) params.append('sort', sort);
    if (search) params.append('search', search);
    const response = await api.get(`/api/products?${params}`);
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  createProduct: async (formData) => {
    const response = await api.post('/api/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateProduct: async (id, formData) => {
    const response = await api.put(`/api/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  }
};

export default ProductService;
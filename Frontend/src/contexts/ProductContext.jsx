import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const ProductContext = createContext();
export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { category, sort, page = 1, limit = 12, search } = filters;
      const params = new URLSearchParams({ page, limit });
      if (category) params.append('category', category);
      if (sort) params.append('sort', sort);
      if (search) params.append('search', search);

      const response = await api.get(`/api/products?${params}`);
      const productList = response.data.products || [];
      setProducts(productList);
      
      const uniqueCategories = [...new Set(productList.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      return response.data;
    } catch (err) {
      setError('Failed to fetch products');
      return { products: [], total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/products?limit=8');
      const productList = response.data.products || [];
      setFeaturedProducts(productList);
      return productList;
    } catch (err) {
      setError('Failed to fetch products');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchProductById = async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/products/${productId}`);
      return response.data.product || response.data;
    } catch (err) {
      setError('Failed to fetch product');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  return (
    <ProductContext.Provider value={{
      products, featuredProducts, categories, loading, error,
      fetchProducts, fetchFeaturedProducts, fetchProductById
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;
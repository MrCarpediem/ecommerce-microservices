import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';


const productApi = axios.create({
  baseURL: import.meta.env.VITE_PRODUCT_SERVICE_URL || 'http://localhost:5003',
  headers: {
    'Content-Type': 'application/json'
  }
});

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
      const { category, sort, page = 1, limit = 10 } = filters;
      let queryString = `/api/products?page=${page}&limit=${limit}`;
      
      if (category) queryString += `&category=${category}`;
      if (sort) queryString += `&sort=${sort}`;
      
      const response = await productApi.get(queryString);
      

      const productList = response.data.products || [];
      
      setProducts(productList);
      return productList;
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productApi.get('/api/products?limit=6');
      
  
      const productList = response.data.products || [];
      
      setFeaturedProducts(productList);
      return productList;
    } catch (err) {
      console.error('Error fetching featured products:', err);
      setError('Failed to fetch featured products');
      
      
      const placeholderProducts = [
        { _id: '1', name: 'Smartphone', price: 799.99, description: 'Latest smartphone with great camera', image: '' },
        { _id: '2', name: 'Laptop', price: 1299.99, description: 'Powerful laptop for work and gaming', image: '' },
        { _id: '3', name: 'Headphones', price: 199.99, description: 'Noise cancelling wireless headphones', image: '' },
        { _id: '4', name: 'Smartwatch', price: 249.99, description: 'Fitness tracker and smartwatch', image: '' },
        { _id: '5', name: 'Tablet', price: 499.99, description: 'Lightweight tablet for productivity', image: '' },
        { _id: '6', name: 'Wireless Earbuds', price: 129.99, description: 'Compact wireless earbuds', image: '' }
      ];
      
      setFeaturedProducts(placeholderProducts);
      return placeholderProducts;
    } finally {
      setLoading(false);
    }
  };


  const fetchProductById = async (productId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productApi.get(`/api/products/${productId}`);
      return response.data;
    } catch (err) {
      console.error(`Error fetching product with ID ${productId}:`, err);
      setError(`Failed to fetch product with ID ${productId}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

 
  const fetchCategories = async () => {
    try {
      const response = await productApi.get('/api/products?limit=100');
      const productList = response.data.products || [];
      
      
      const uniqueCategories = [...new Set(productList.map(product => product.category))];
      setCategories(uniqueCategories);
      
      return uniqueCategories;
    } catch (err) {
      console.error('Error fetching categories:', err);
      return [];
    }
  };

  
  const createProduct = async (productData, token) => {
    try {
      const formData = new FormData();
      
      
      Object.keys(productData).forEach(key => {
        if (key !== 'image' || (key === 'image' && productData[key] instanceof File)) {
          formData.append(key, productData[key]);
        }
      });
      
      const response = await productApi.post('/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      fetchProducts();
      
      return response.data;
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  };


  const updateProduct = async (productId, productData, token) => {
    try {
      const formData = new FormData();
      
      
      Object.keys(productData).forEach(key => {
        if (key !== 'image' || (key === 'image' && productData[key] instanceof File)) {
          formData.append(key, productData[key]);
        }
      });
      
      const response = await productApi.put(`/api/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
     
      fetchProducts();
      
      return response.data;
    } catch (err) {
      console.error(`Error updating product with ID ${productId}:`, err);
      throw err;
    }
  };

  const deleteProduct = async (productId, token) => {
    try {
      const response = await productApi.delete(`/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      
      fetchProducts();
      
      return response.data;
    } catch (err) {
      console.error(`Error deleting product with ID ${productId}:`, err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const value = {
    products,
    featuredProducts,
    categories,
    loading,
    error,
    fetchProducts,
    fetchFeaturedProducts,
    fetchProductById,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;

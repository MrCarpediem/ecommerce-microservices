const axios = require('axios');
require('dotenv').config();

const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:5000';

class ServiceClient {
  async getServiceUrl(serviceName) {
    try {
      const response = await axios.get(`${REGISTRY_URL}/service/${serviceName}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get ${serviceName} service details:`, error.message);
      throw error;
    }
  }
  
  async registerService(name, url, endpoints) {
    try {
      const response = await axios.post(`${REGISTRY_URL}/register`, {
        name,
        url,
        endpoints
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to register ${name} service:`, error.message);
      throw error;
    }
  }
  
  async getProductDetails(productId) {
    try {
      // Get product service details from registry
      const productService = await this.getServiceUrl('product');
      
      // Get product details from product service
      const response = await axios.get(
        `${productService.url}/api/products/${productId}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching product details:', error.message);
      throw error;
    }
  }
  
  async clearCart(userId) {
    try {
      // Get cart service details from registry
      const cartService = await this.getServiceUrl('cart');
      
      // Clear the user's cart after successful order creation
      const response = await axios.delete(
        `${cartService.url}/api/carts/clear`,
        { data: { userId } }  // Send userId in the body of the DELETE request
      );
      
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error.message);
      throw error;
    }
  }
}

module.exports = new ServiceClient();
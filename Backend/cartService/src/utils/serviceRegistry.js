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
  
  async getProductDetails(productId) {
    try {
      // Get product service details from registry
      const productService = await this.getServiceUrl('product');
      
      // Get product details from product service without token
      const response = await axios.get(
        `${productService.url}/api/products/${productId}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching product details:', error.message);
      throw error;
    }
  }
}

module.exports = new ServiceClient();
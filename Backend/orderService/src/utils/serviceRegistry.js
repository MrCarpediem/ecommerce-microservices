const axios = require('axios');
const logger = require('./logger');

const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:5000';
const SERVICE_SECRET = process.env.SERVICE_SECRET;

class ServiceClient {
  async getServiceUrl(serviceName) {
    try {
      const response = await axios.get(`${REGISTRY_URL}/service/${serviceName}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get ${serviceName} service URL:`, error.message);
      throw new Error(`Service ${serviceName} not found in registry`);
    }
  }

  async getProductDetails(productId) {
    try {
      const productService = await this.getServiceUrl('product');
      const response = await axios.get(
        `${productService.url}/api/products/${productId}`
      );
      // productService returns { success: true, product: {...} }
      return response.data.product || response.data;
    } catch (error) {
      logger.error('Error fetching product details:', error.message);
      throw new Error(`Product ${productId} not found`);
    }
  }

  async clearCart(userId) {
    try {
      const cartService = await this.getServiceUrl('cart');
      const response = await axios.post(
        `${cartService.url}/api/cart/internal/clear`,
        { userId },
        {
          headers: { 'x-service-secret': SERVICE_SECRET }
        }
      );
      return response.data;
    } catch (error) {
      logger.error('Error clearing cart:', error.message);
      throw new Error('Cart service unavailable');
    }
  }
}

module.exports = new ServiceClient();
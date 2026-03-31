const axios = require('axios');
const logger = require('./logger');

const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:5000';

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
}

module.exports = new ServiceClient();
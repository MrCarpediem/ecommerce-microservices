import axios from 'axios';


const REGISTRY_URL = import.meta.env.VITE_REGISTRY_URL || 'http://localhost:5000';


const apiClient = {
 
  getServiceDetails: async (serviceName) => {
    try {
      const response = await axios.get(`${REGISTRY_URL}/service/${serviceName}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get service details for ${serviceName}:`, error);
      throw error;
    }
  },

  
  request: async (serviceName, endpoint, options = {}) => {
    try {
 
      const serviceDetails = await apiClient.getServiceDetails(serviceName);

      const { method = 'GET', data, headers = {} } = options;
      const url = `${serviceDetails.url}${endpoint}`;

      const response = await axios({
        method,
        url,
        data,
        headers,
      });

      return response.data;
    } catch (error) {
      console.error(`API request error for ${serviceName}:`, error);
      throw error;
    }
  }
};

export default apiClient;

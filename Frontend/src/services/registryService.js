import axios from 'axios';

const REGISTRY_URL = import.meta.env.VITE_REGISTRY_URL || 'http://localhost:5000';

export const getServiceUrl = async (serviceName) => {
  try {
    const response = await axios.get(`${REGISTRY_URL}/service/${serviceName}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get ${serviceName} service details:`, error);
    throw new Error(`Service ${serviceName} unavailable`);
  }
};

export const getAllServices = async () => {
  try {
    const response = await axios.get(`${REGISTRY_URL}/services`);
    return response.data;
  } catch (error) {
    console.error('Failed to get services list:', error);
    throw new Error('Service registry unavailable');
  }
};

export const proxyRequest = async (service, endpoint, options = {}) => {
  try {
    const response = await axios.post(`${REGISTRY_URL}/proxy/${service}/${endpoint}`, options);
    return response.data;
  } catch (error) {
    console.error(`Proxy request to ${service}/${endpoint} failed:`, error);
    throw error.response?.data || new Error('Service request failed');
  }
};
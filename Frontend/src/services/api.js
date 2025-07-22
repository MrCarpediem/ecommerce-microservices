import axios from 'axios';


const REGISTRY_URL = import.meta.env.VITE_REGISTRY_URL || 'http://localhost:5000';


const api = axios.create({
  baseURL: REGISTRY_URL,
});


export const getServiceDetails = async (serviceName) => {
  try {
    const response = await api.get(`/service/${serviceName}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get ${serviceName} service details:`, error);
    throw error;
  }
};

export const createServiceApi = async (serviceName) => {
  try {
    const serviceDetails = await getServiceDetails(serviceName);
    
    return {
      instance: axios.create({
        baseURL: serviceDetails.url,
      }),
      endpoints: serviceDetails.endpoints,
    };
  } catch (error) {
    console.error(`Failed to create API for ${serviceName}:`, error);
    throw error;
  }
};


export const proxyRequest = async (service, endpoint, method, url, data, token) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await api.post(`/proxy/${service}/${endpoint}`, {
      method,
      url,
      data,
      headers,
    });

    return response.data;
  } catch (error) {
    console.error('Proxy request failed:', error);
    throw error.response?.data || error;
  }
};

export const getToken = () => {
  return localStorage.getItem('token');
};

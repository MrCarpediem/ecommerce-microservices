const axios = require('axios');
require('dotenv').config();

const verifyToken = async (req, res, next) => {
  try {
    // Get the token from the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Get registry URL from environment
    const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:5000';
    
    // Get auth service details from registry
    const registryResponse = await axios.get(`${REGISTRY_URL}/service/auth`);
    const authService = registryResponse.data;
    
    // Validate token using auth service
    const authResponse = await axios.post(
      `${authService.url}/api/auth/validate-token`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (authResponse.data && authResponse.data.valid) {
      // Set user ID from the decoded token
      req.userId = authResponse.data.userId;
      next();
    } else {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ message: 'Token verification failed', error: error.message });
  }
};

module.exports = { verifyToken };
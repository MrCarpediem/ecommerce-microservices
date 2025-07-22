const axios = require('axios');
require('dotenv').config();

const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:5000';

const authMiddleware = {
  verifyToken: async (req, res, next) => {
    try {
      // Since we're using userId from the body and not the token,
      // this middleware is simplified to just check if a userId exists
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'UserId is required in the request body' });
      }
      
      // If you still need to verify that the user exists, you could make a call to the user service
      // But for now, we'll just pass through since we're accepting userId from the body
      
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  }
};

module.exports = authMiddleware;
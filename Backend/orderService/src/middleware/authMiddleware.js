const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = {
  authenticate: (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required. No token provided.' });
      }

      const token = authHeader.split(' ')[1];
      const JWT_SECRET = process.env.JWT_SECRET;
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = {
        userId: decoded.userId,
        role: decoded.role,
        email: decoded.email,
        username: decoded.username
      };

      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  }
};

module.exports = authMiddleware;
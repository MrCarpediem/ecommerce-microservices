const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const routes = require('../config/routes');

const getPublicRoutes = () => {
  const publicRoutes = [];
  Object.values(routes).forEach(route => {
    publicRoutes.push(...route.public);
  });
  return publicRoutes;
};

const authenticate = (req, res, next) => {
  // Gateway health checks always public
  if (req.path === '/health' || req.path === '/health/services') {
    return next();
  }

  const publicRoutes = getPublicRoutes();

  const isPublic = publicRoutes.some(route => {
    if (req.path.startsWith(route) && req.method === 'GET') return true;
    if (req.path === route) return true;
    return false;
  });

  if (isPublic) return next();

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.headers['x-user-id'] = decoded.userId;
    req.headers['x-user-role'] = decoded.role;
    req.headers['x-user-email'] = decoded.email;

    next();
  } catch (err) {
    logger.error('Gateway auth error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = { authenticate };
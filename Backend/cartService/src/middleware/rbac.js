const logger = require('../utils/logger');

const authorize = (resource, action) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      if (!userRole) {
        return res.status(403).json({ error: 'No role assigned.' });
      }

      // Admin bypass
      if (userRole === 'admin') return next();

      // For cart service — customer & seller can access cart
      const allowedRoles = {
        cart: {
          read: ['customer', 'seller'],
          create: ['customer', 'seller'],
          update: ['customer', 'seller'],
          delete: ['customer', 'seller']
        }
      };

      const allowed = allowedRoles[resource]?.[action]?.includes(userRole);
      if (!allowed) {
        logger.warn(`Access denied: ${userRole} tried ${action} on ${resource}`);
        return res.status(403).json({
          error: `Access denied. Required: ${action} on ${resource}`
        });
      }

      next();
    } catch (err) {
      logger.error('RBAC error:', err.message);
      return res.status(500).json({ error: 'Authorization error.' });
    }
  };
};

module.exports = { authorize };
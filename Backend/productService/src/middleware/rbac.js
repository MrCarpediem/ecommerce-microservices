const logger = require('../utils/logger');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      if (!userRole) {
        return res.status(403).json({ error: 'No role assigned.' });
      }

      if (!allowedRoles.includes(userRole)) {
        logger.warn(`Access denied: ${userRole} tried to access restricted route`);
        return res.status(403).json({
          error: `Access denied. Required roles: ${allowedRoles.join(', ')}`
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
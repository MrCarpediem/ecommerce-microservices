const logger = require('../utils/logger');

const authorize = (resource, action) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      if (!userRole) {
        return res.status(403).json({ error: 'No role assigned.' });
      }

      // Admin can do everything
      if (userRole.name === 'admin') return next();

      const hasPermission = userRole.permissions?.some(
        (p) => p.resource === resource && p.actions.includes(action)
      );

      if (!hasPermission) {
        logger.warn(`Access denied: ${userRole.name} tried ${action} on ${resource}`);
        return res.status(403).json({
          error: `Access denied. Required: ${action} on ${resource}`
        });
      }

      next();
    } catch (err) {
      logger.error('RBAC middleware error:', err.message);
      return res.status(500).json({ error: 'Authorization error.' });
    }
  };
};

module.exports = { authorize };
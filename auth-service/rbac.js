const authorize = (resource, action) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    
    // Admin has access to everything
    if (userRole.name === 'admin') {
      return next();
    }
    
    // Check if user's role has permission for this resource and action
    const hasPermission = userRole.permissions.some(permission => 
      permission.resource === resource && 
      permission.actions.includes(action)
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        error: `Access denied. Required permission: ${action} on ${resource}` 
      });
    }

    next();
  };
};

module.exports = { authorize };

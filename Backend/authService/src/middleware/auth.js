const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).populate('role');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token or account deactivated.' });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error('Auth middleware error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = { authenticate };
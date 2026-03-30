const User = require('../models/User');
const Role = require('../models/Role');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('customer', 'seller', 'moderator', 'admin').default('customer')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register
const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, email, password, role: roleName } = value;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered.' });

    const role = await Role.findOne({ name: roleName });
    if (!role) return res.status(400).json({ error: 'Invalid role.' });

    const user = await User.create({ name, email, password, role: role._id });
    await user.populate('role');

    const accessToken = generateAccessToken({ userId: user._id, role: role.name });
    const refreshToken = generateRefreshToken({ userId: user._id });

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    logger.info(`New user registered: ${email}`);
    res.status(201).json({ message: 'Registered successfully', accessToken, refreshToken, user });

  } catch (err) {
    logger.error('Register error:', err.message);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = value;

    const user = await User.findOne({ email }).populate('role');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (!user.isActive) return res.status(401).json({ error: 'Account deactivated.' });

    const accessToken = generateAccessToken({ userId: user._id, role: user.role.name });
    const refreshToken = generateRefreshToken({ userId: user._id });

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${email}`);
    res.json({ message: 'Login successful', accessToken, refreshToken, user });

  } catch (err) {
    logger.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

// Refresh Token
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required.' });

    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId).populate('role');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    const accessToken = generateAccessToken({ userId: user._id, role: user.role.name });
    res.json({ accessToken });

  } catch (err) {
    logger.error('Refresh error:', err.message);
    res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    logger.info(`User logged out: ${req.user.email}`);
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    logger.error('Logout error:', err.message);
    res.status(500).json({ error: 'Server error during logout.' });
  }
};

// Get current user
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// Validate token (for other services)
const validateToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('role');
    if (!user) return res.status(404).json({ valid: false });

    res.json({ valid: true, userId: user._id, email: user.email, role: user.role.name });
  } catch (err) {
    res.status(401).json({ valid: false, message: err.message });
  }
};

module.exports = { register, login, refresh, logout, getMe, validateToken };
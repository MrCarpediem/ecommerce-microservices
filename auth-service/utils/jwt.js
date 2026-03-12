const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const { generateToken, generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
// Validation schemas
// validation/registerSchema.js

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(), 
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('customer', 'seller', 'admin', 'moderator').default('customer'),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  address: Joi.object({
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    pincode: Joi.string().pattern(/^[0-9]{6}$/),
    country: Joi.string().default('India')
  }).optional()
});

module.exports = registerSchema;

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  address: Joi.object({
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    pincode: Joi.string().pattern(/^[0-9]{6}$/),
    country: Joi.string()
  }).optional()
});

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: error.details.map(d => d.message)
      });
    }

    const { name, email, password, role: roleName = 'customer', phone, address } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Get role
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: role._id,
      profile: { phone, address }
    });

    await user.save();
    await user.populate('role');

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
      role: role.name
    });

    const refreshToken = generateRefreshToken({ userId: user._id });

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: error.details.map(d => d.message)
      });
    }

    const { email, password } = req.body;

    // Find user and populate role
    const user = await User.findOne({ email: email.toLowerCase() }).populate('role');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated. Please contact support.' });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role.name
    });
    const refreshToken = generateRefreshToken({ userId: user._id });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { error } = refreshTokenSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user
    const user = await User.findById(decoded.userId).populate('role');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role.name
    });

    res.json({
      message: 'Token refreshed successfully',
      accessToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profile: req.user.profile,
        isActive: req.user.isActive,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: error.details.map(d => d.message)
      });
    }

    const updateData = {};
    const { name, phone, address } = req.body;

    if (name) updateData.name = name.trim();
    if (phone) updateData['profile.phone'] = phone;
    if (address) updateData['profile.address'] = address;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('role');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error during profile update' });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: error.details.map(d => d.message)
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const user = await User.findById(req.user._id);
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error during password change' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (In a real app, you'd blacklist the token)
// @access  Private
router.post('/logout', authenticate, async (req, res) => {
  try {
    // In a production app, you would:
    // 1. Add the token to a blacklist in Redis
    // 2. Or maintain a session store
    // For now, we just return success
    
    res.json({ 
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
});

// @route   DELETE /api/auth/account
// @desc    Delete user account
// @access  Private
router.delete('/account', authenticate, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password confirmation required' });
    }

    // Verify password
    const isPasswordValid = await req.user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Don't allow admin to delete their own account if they're the only admin
    if (req.user.role.name === 'admin') {
      const adminCount = await User.countDocuments({ 
        role: req.user.role._id,
        isActive: true 
      });
      
      if (adminCount <= 1) {
        return res.status(400).json({ 
          error: 'Cannot delete the last admin account' 
        });
      }
    }

    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Server error during account deletion' });
  }
});

module.exports = router; 

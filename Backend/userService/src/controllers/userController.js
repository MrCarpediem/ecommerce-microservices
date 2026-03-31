const UserProfile = require('../models/userModel');
const logger = require('../utils/logger');
const Joi = require('joi');

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  preferences: Joi.object({
    theme: Joi.string().valid('light', 'dark'),
    notifications: Joi.boolean(),
    language: Joi.string()
  }).optional()
});

const addressSchema = Joi.object({
  label: Joi.string().valid('home', 'work', 'other').default('home'),
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string().required(),
  country: Joi.string().default('India'),
  isDefault: Joi.boolean().default(false)
});

// GET /api/users/profile
const getUserProfile = async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = await UserProfile.create({ userId: req.user._id });
    }

    res.json({ success: true, profile });
  } catch (err) {
    logger.error('Get profile error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
};

// PUT /api/users/profile
const updateUserProfile = async (req, res) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    let profile = await UserProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = await UserProfile.create({ userId: req.user._id, ...value });
    } else {
      Object.assign(profile, value);
      await profile.save();
    }

    logger.info(`Profile updated for user: ${req.user._id}`);
    res.json({ success: true, profile });
  } catch (err) {
    logger.error('Update profile error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST /api/users/addresses
const addAddress = async (req, res) => {
  try {
    const { error, value } = addressSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    let profile = await UserProfile.findOne({ userId: req.user._id });
    if (!profile) profile = await UserProfile.create({ userId: req.user._id });

    // Agar isDefault true hai toh baaki sab false karo
    if (value.isDefault) {
      profile.addresses.forEach(addr => addr.isDefault = false);
    }

    profile.addresses.push(value);
    await profile.save();

    logger.info(`Address added for user: ${req.user._id}`);
    res.status(201).json({ success: true, addresses: profile.addresses });
  } catch (err) {
    logger.error('Add address error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
};

// DELETE /api/users/addresses/:addressId
const removeAddress = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    profile.addresses = profile.addresses.filter(
      addr => addr._id.toString() !== req.params.addressId
    );
    await profile.save();

    res.json({ success: true, addresses: profile.addresses });
  } catch (err) {
    logger.error('Remove address error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/users/:userId — internal service use
const getUserById = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ error: 'User profile not found.' });
    res.json({ success: true, profile });
  } catch (err) {
    logger.error('Get user by ID error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/users — admin only
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [profiles, total] = await Promise.all([
      UserProfile.find()
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum),
      UserProfile.countDocuments()
    ]);

    res.json({ success: true, total, totalPages: Math.ceil(total / limitNum), currentPage: pageNum, profiles });
  } catch (err) {
    logger.error('Get all users error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { getUserProfile, updateUserProfile, addAddress, removeAddress, getUserById, getAllUsers };
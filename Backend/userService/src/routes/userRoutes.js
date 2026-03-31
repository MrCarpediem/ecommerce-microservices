const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  getUserProfile,
  updateUserProfile,
  addAddress,
  removeAddress,
  getUserById,
  getAllUsers
} = require('../controllers/userController');

// Protected routes
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
router.post('/addresses', authenticate, addAddress);
router.delete('/addresses/:addressId', authenticate, removeAddress);

// Admin only
router.get('/', authenticate, authorize('admin'), getAllUsers);

// Internal service route
router.get('/:userId', getUserById);

module.exports = router;
// auth-service/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, login, getUser, validateToken, getUserById } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/validate-token', validateToken);

// Protected routes
router.get('/user', authenticate, getUser);

// Internal service routes - for inter-service communication
router.get('/users/:userId', getUserById);

module.exports = router;
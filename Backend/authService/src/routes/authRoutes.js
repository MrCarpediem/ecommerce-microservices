const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, getMe, validateToken } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/validate-token', validateToken);

// Protected
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

module.exports = router;
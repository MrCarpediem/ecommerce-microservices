const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  getUserCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../controllers/cartController');

// Internal service middleware
const internalOnly = (req, res, next) => {
  const secret = req.headers['x-service-secret'];
  if (!secret || secret !== process.env.SERVICE_SECRET) {
    return res.status(403).json({ error: 'Internal access only.' });
  }
  // Set userId from body for internal calls
  req.user = { _id: req.body.userId };
  next();
};

// Public (authenticated) routes
router.get('/', authenticate, authorize('cart', 'read'), getUserCart);
router.post('/items', authenticate, authorize('cart', 'create'), addCartItem);
router.put('/items/:itemId', authenticate, authorize('cart', 'update'), updateCartItem);
router.delete('/items/:itemId', authenticate, authorize('cart', 'delete'), removeCartItem);
router.delete('/', authenticate, authorize('cart', 'delete'), clearCart);

// Internal route (called by orderService after order placed)
router.post('/internal/clear', internalOnly, clearCart);

module.exports = router;
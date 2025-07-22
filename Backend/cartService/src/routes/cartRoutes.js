const express = require('express');
const cartController = require('../controllers/cartController');

const router = express.Router();

// Cart routes - no auth middleware needed anymore
router.post('/get', cartController.getUserCart);
router.post('/items', cartController.addCartItem);
router.put('/items/:itemId', cartController.updateCartItem);
router.post('/items/:itemId/remove', cartController.removeCartItem);
router.post('/clear', cartController.clearCart);

module.exports = router;
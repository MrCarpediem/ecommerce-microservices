const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all orders for a specific user (userId from body)
router.get('/', orderController.getAllOrders);

// Get a specific order by id
router.get('/:id', orderController.getOrderById);

// Create a new order
router.post('/', orderController.createOrder);

// Update order status
router.patch('/:id/status', authMiddleware.verifyToken, orderController.updateOrderStatus);

// Update payment status
router.patch('/:id/payment', authMiddleware.verifyToken, orderController.updatePaymentStatus);

// Cancel an order
router.patch('/:id/cancel', authMiddleware.verifyToken, orderController.cancelOrder);

module.exports = router;
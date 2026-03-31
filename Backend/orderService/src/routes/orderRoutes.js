const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrdersAdmin
} = require('../controllers/orderController');

// Admin — all orders
router.get('/admin/all', authenticate, authorize('admin'), getAllOrdersAdmin);

// Customer routes
router.get('/', authenticate, getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/', authenticate, createOrder);
router.patch('/:id/cancel', authenticate, cancelOrder);

// Admin/Seller — status update
router.patch('/:id/status', authenticate, authorize('admin', 'seller'), updateOrderStatus);

module.exports = router;
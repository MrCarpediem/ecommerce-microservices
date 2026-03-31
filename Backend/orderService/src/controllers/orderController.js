const Order = require('../models/orderModel');
const ServiceClient = require('../utils/serviceRegistry');
const logger = require('../utils/logger');
const Joi = require('joi');

const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().default('India')
  }).required(),
  paymentMethod: Joi.string()
    .valid('Credit Card', 'Debit Card', 'UPI', 'Cash on Delivery', 'PayPal')
    .required()
});

// GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const query = { userId: req.user._id };
    if (status) query.orderStatus = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders
    });
  } catch (error) {
    logger.error('Get all orders error:', error.message);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) return res.status(404).json({ error: 'Order not found.' });

    res.json({ success: true, order });
  } catch (error) {
    logger.error('Get order by ID error:', error.message);
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
};

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { items, shippingAddress, paymentMethod } = value;

    // Verify products + calculate total
    let totalAmount = 0;
    const enrichedItems = [];

    for (const item of items) {
      try {
        const product = await ServiceClient.getProductDetails(item.productId);

        if (product.stock < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for product: ${product.name}`
          });
        }

        enrichedItems.push({
          productId: item.productId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          imageUrl: product.image || ''
        });

        totalAmount += product.price * item.quantity;
      } catch {
        return res.status(400).json({ error: `Invalid product: ${item.productId}` });
      }
    }

    const order = await Order.create({
      userId: req.user._id,
      items: enrichedItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      shippingAddress,
      paymentMethod
    });

    // Clear cart after order — non blocking
    ServiceClient.clearCart(req.user._id.toString()).catch(err =>
      logger.warn('Cart clear failed after order:', err.message)
    );

    logger.info(`Order created: ${order._id} by user: ${req.user._id}`);
    res.status(201).json({ success: true, order });
  } catch (error) {
    logger.error('Create order error:', error.message);
    res.status(500).json({ error: 'Failed to create order.' });
  }
};

// PATCH /api/orders/:id/status — admin/seller only
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    if (orderStatus === 'Delivered') order.deliveredAt = new Date();
    if (orderStatus === 'Cancelled') order.cancelledAt = new Date();

    order.orderStatus = orderStatus;
    await order.save();

    logger.info(`Order ${order._id} status updated to ${orderStatus}`);
    res.json({ success: true, order });
  } catch (error) {
    logger.error('Update order status error:', error.message);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
};

// PATCH /api/orders/:id/cancel — customer apna order cancel kare
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) return res.status(404).json({ error: 'Order not found.' });

    if (!['Processing', 'Confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        error: 'Cannot cancel order that has been shipped or delivered.'
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    await order.save();

    logger.info(`Order ${order._id} cancelled by user: ${req.user._id}`);
    res.json({ success: true, order });
  } catch (error) {
    logger.error('Cancel order error:', error.message);
    res.status(500).json({ error: 'Failed to cancel order.' });
  }
};

// GET /api/orders/admin/all — admin only
const getAllOrdersAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const query = status ? { orderStatus: status } : {};

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum),
      Order.countDocuments(query)
    ]);

    res.json({ success: true, total, totalPages: Math.ceil(total / limitNum), currentPage: pageNum, orders });
  } catch (error) {
    logger.error('Admin get all orders error:', error.message);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};

module.exports = { getAllOrders, getOrderById, createOrder, updateOrderStatus, cancelOrder, getAllOrdersAdmin };
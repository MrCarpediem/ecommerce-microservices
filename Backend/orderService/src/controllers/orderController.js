const Order = require('../models/orderModel');
const ServiceClient = require('../utils/serviceRegistry');

const orderController = {
  // Get all orders for a user
  getAllOrders: async (req, res) => {
    try {
      // Get userId from request body
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'UserId is required in the request body' });
      }

      const orders = await Order.find({ userId }).sort({ createdAt: -1 });
      res.json(orders);
    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  },

  // Get a specific order by ID
  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'UserId is required in the request body' });
      }

      const order = await Order.findOne({ _id: id, userId });
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      console.error('Get order by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  },

  // Create a new order
  createOrder: async (req, res) => {
    try {
      const { userId, items, totalAmount, shippingAddress, paymentMethod } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'UserId is required' });
      }
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain items' });
      }
      
      // Validate items (you might want to verify these against the product service)
      for (const item of items) {
        try {
          // Get product details to verify price and availability
          const productDetails = await ServiceClient.getProductDetails(item.productId);
          
          // Update item with verified details
          item.name = productDetails.name;
          item.price = productDetails.price;
          item.imageUrl = productDetails.imageUrl;
        } catch (error) {
          console.error(`Failed to verify product ${item.productId}:`, error.message);
          return res.status(400).json({ error: `Invalid product: ${item.productId}` });
        }
      }

      // Create new order
      const newOrder = new Order({
        userId,
        items,
        totalAmount,
        shippingAddress,
        paymentMethod
      });

      await newOrder.save();
      
      // Clear user's cart after successful order
      try {
        await ServiceClient.clearCart(userId);
      } catch (error) {
        console.error('Failed to clear cart after order creation:', error.message);
        // Continue with order creation even if cart clearing fails
      }

      res.status(201).json(newOrder);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  },

  // Update order status
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { orderStatus, userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'UserId is required in the request body' });
      }

      const order = await Order.findOne({ _id: id, userId });
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      order.orderStatus = orderStatus;
      await order.save();
      
      res.json(order);
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  },

  // Update payment status
  updatePaymentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentStatus, userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'UserId is required in the request body' });
      }

      const order = await Order.findOne({ _id: id, userId });
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      order.paymentStatus = paymentStatus;
      await order.save();
      
      res.json(order);
    } catch (error) {
      console.error('Update payment status error:', error);
      res.status(500).json({ error: 'Failed to update payment status' });
    }
  },

  // Cancel an order
  cancelOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'UserId is required in the request body' });
      }

      const order = await Order.findOne({ _id: id, userId });
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Only allow cancellation if order is still processing
      if (order.orderStatus !== 'Processing') {
        return res.status(400).json({ 
          error: 'Cannot cancel order that has been shipped or delivered' 
        });
      }
      
      order.orderStatus = 'Cancelled';
      await order.save();
      
      res.json(order);
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({ error: 'Failed to cancel order' });
    }
  }
};

module.exports = orderController;
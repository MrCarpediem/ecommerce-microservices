const Cart = require('../models/Cart');
const serviceClient = require('../utils/serviceRegistry');
const logger = require('../utils/logger');
const Joi = require('joi');

const addItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1)
});

const updateItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required()
});

// GET /api/cart
const getUserCart = async (req, res) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    res.json({ success: true, cart });
  } catch (error) {
    logger.error('Get cart error:', error.message);
    res.status(500).json({ error: 'Failed to get cart.' });
  }
};

// POST /api/cart/items
const addCartItem = async (req, res) => {
  try {
    const { error, value } = addItemSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { productId, quantity } = value;
    const userId = req.user._id;

    // Fetch product from product service
    let product;
    try {
      product = await serviceClient.getProductDetails(productId);
    } catch {
      return res.status(404).json({ error: 'Product not found or product service unavailable.' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    const existingIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image || ''
      });
    }

    await cart.save();
    logger.info(`Item added to cart for user: ${userId}`);
    res.status(201).json({ success: true, cart });
  } catch (error) {
    logger.error('Add to cart error:', error.message);
    res.status(500).json({ error: 'Failed to add item to cart.' });
  }
};

// PUT /api/cart/items/:itemId
const updateCartItem = async (req, res) => {
  try {
    const { error, value } = updateItemSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { itemId } = req.params;
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found.' });

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) return res.status(404).json({ error: 'Item not found in cart.' });

    cart.items[itemIndex].quantity = value.quantity;
    await cart.save();

    res.json({ success: true, cart });
  } catch (error) {
    logger.error('Update cart item error:', error.message);
    res.status(500).json({ error: 'Failed to update cart item.' });
  }
};

// DELETE /api/cart/items/:itemId
const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found.' });

    const originalLength = cart.items.length;
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    if (cart.items.length === originalLength) {
      return res.status(404).json({ error: 'Item not found in cart.' });
    }

    await cart.save();
    res.json({ success: true, cart });
  } catch (error) {
    logger.error('Remove cart item error:', error.message);
    res.status(500).json({ error: 'Failed to remove cart item.' });
  }
};

// DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found.' });

    cart.items = [];
    await cart.save();

    logger.info(`Cart cleared for user: ${userId}`);
    res.json({ success: true, message: 'Cart cleared.', cart });
  } catch (error) {
    logger.error('Clear cart error:', error.message);
    res.status(500).json({ error: 'Failed to clear cart.' });
  }
};

module.exports = { getUserCart, addCartItem, updateCartItem, removeCartItem, clearCart };
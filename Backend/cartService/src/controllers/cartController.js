const Cart = require('../models/Cart');
const serviceClient = require('../utils/serviceRegistry');

// Get cart for specified user
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      // Create a new cart if none exists
      cart = new Cart({
        userId,
        items: []
      });
      await cart.save();
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error.message);
    res.status(500).json({ message: 'Failed to get cart', error: error.message });
  }
};

// Add item to cart
const addCartItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Get product details from product service
    // Since we're not using tokens anymore, we need to modify how we get product details
    const product = await serviceClient.getProductDetails(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find user's cart or create new one
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({
        userId,
        items: []
      });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += parseInt(quantity || 1);
    } else {
      // Add new item
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        quantity: parseInt(quantity || 1),
        image: product.image || ''
      });
    }
    
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.status(201).json(cart);
  } catch (error) {
    console.error('Add to cart error:', error.message);
    res.status(500).json({ message: 'Failed to add item to cart', error: error.message });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId, quantity } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    cart.items[itemIndex].quantity = parseInt(quantity);
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Update cart item error:', error.message);
    res.status(500).json({ message: 'Failed to update cart item', error: error.message });
  }
};

// Remove item from cart
const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Remove cart item error:', error.message);
    res.status(500).json({ message: 'Failed to remove cart item', error: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    console.error('Clear cart error:', error.message);
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
};

module.exports = {
  getUserCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart
};
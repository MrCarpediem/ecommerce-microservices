import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getUserCart,
  addItemToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearUserCart
} from '../services/cartService';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ items: [] });
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserCart();
      // Response: { success: true, cart: {...} }
      setCart(data.cart || data);
    } catch (err) {
      setError('Failed to fetch cart');
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) return false;
    setLoading(true);
    try {
      const data = await addItemToCart(productId, quantity);
      setCart(data.cart || data);
      return true;
    } catch (err) {
      setError('Failed to add item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (quantity < 1) return removeCartItem(itemId);
    setLoading(true);
    try {
      const data = await updateCartItemQuantity(itemId, quantity);
      setCart(data.cart || data);
      return true;
    } catch (err) {
      setError('Failed to update cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeCartItem = async (itemId) => {
    setLoading(true);
    try {
      const data = await removeFromCart(itemId);
      setCart(data.cart || data);
      return true;
    } catch (err) {
      setError('Failed to remove item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      await clearUserCart();
      setCart({ items: [] });
      return true;
    } catch (err) {
      setError('Failed to clear cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCartTotals = () => {
    const items = cart?.items || [];
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      itemCount,
      subtotal,
      formattedSubtotal: `₹${subtotal.toFixed(2)}`
    };
  };

  return (
    <CartContext.Provider value={{
      cart, loading, error,
      fetchCart, addToCart, updateCartItem,
      removeCartItem, clearCart, getCartTotals
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
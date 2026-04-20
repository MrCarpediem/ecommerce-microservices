import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useOrder } from '../contexts/OrderContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, CheckCircle, Tag, ShoppingBag, CreditCard, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, error, fetchCart, updateCartItem, removeCartItem, clearCart, getCartTotals } = useCart();
  const { isAuthenticated, currentUser } = useAuth();
  const { placeOrder } = useOrder();
  
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({ street: '', city: '', state: '', zipCode: '', country: '' });
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [checkoutError, setCheckoutError] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showCouponInput, setShowCouponInput] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      if (currentUser?.address) setShippingAddress(currentUser.address);
    }
  }, [isAuthenticated, currentUser]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Remove this item from your cart?')) await removeCartItem(itemId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Clear your entire cart?')) {
      await clearCart();
      setCouponApplied(false);
      setDiscountAmount(0);
    }
  };

  const handleCheckout = () => {
    setCheckoutMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === 'shop10') {
      const { subtotal } = getCartTotals();
      setDiscountAmount(subtotal * 0.1);
      setCouponApplied(true);
      setShowCouponInput(false);
    } else if (couponCode.toLowerCase() === 'welcome20') {
      const { subtotal } = getCartTotals();
      setDiscountAmount(subtotal * 0.2);
      setCouponApplied(true);
      setShowCouponInput(false);
    } else {
      alert('Invalid coupon code. Try "SHOP10" or "WELCOME20"');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setDiscountAmount(0);
    setCouponCode('');
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setCheckoutError(null);
    setProcessingOrder(true);
    
    try {
      for (const [key, value] of Object.entries(shippingAddress)) {
        if (!value.trim()) throw new Error(`${key.charAt(0).toUpperCase() + key.slice(1)} is required`);
      }
      if (!paymentMethod) throw new Error('Payment method is required');
      
      const { subtotal } = getCartTotals();
      const finalAmount = couponApplied ? subtotal - discountAmount : subtotal;
      
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingAddress,
        paymentMethod
      };
      
      const newOrder = await placeOrder(orderData);
      if (newOrder) {
        await clearCart();
        navigate('/order-success', { state: { orderId: newOrder._id } });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (err) {
      setCheckoutError(err.message || 'Failed to place order');
    } finally {
      setProcessingOrder(false);
    }
  };

  const { itemCount, subtotal, formattedSubtotal } = getCartTotals();
  const finalTotal = couponApplied ? subtotal - discountAmount : subtotal;
  const formattedFinalTotal = `₹${finalTotal.toFixed(2)}`;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-slate-100">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Sign in to Shop</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">Access your saved cart and checkout faster by logging into your account.</p>
          <Link to="/login" className="w-full flex justify-center items-center py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-1">
            Sign In to Continue
          </Link>
          <p className="mt-6 text-sm text-slate-500">New here? <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">Create an account</Link></p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-24">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-24">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-slate-100">
          <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Your cart is empty</h2>
          <p className="text-slate-500 mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="w-full flex justify-center items-center py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Checkout</h1>
            <p className="text-slate-500 mt-1">{itemCount} items in your bag</p>
          </div>
          {checkoutMode && (
            <button onClick={() => setCheckoutMode(false)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft size={16} /> Back to Cart
            </button>
          )}
        </div>

        {checkoutError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
            <div className="bg-white p-1 rounded-full"><Trash2 size={16} /></div>
            <p className="font-medium text-sm">{checkoutError}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content Area */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {!checkoutMode ? (
                <motion.div key="cart-items" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">Review Items</h2>
                    <button onClick={handleClearCart} className="text-xs font-bold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-full bg-rose-50 transition-colors">Clear All</button>
                  </div>
                  
                  <div className="divide-y divide-slate-50">
                    {cart.items.map((item) => (
                      <motion.div layout key={item._id} className="p-6 flex gap-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                          {item.image ? (
                            <img src={item.image?.startsWith('http') ? item.image : `${import.meta.env.VITE_API_GATEWAY_URL || ''}${item.image}`} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag size={24} /></div>
                          )}
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{item.name}</h3>
                              <p className="text-slate-500 font-medium tracking-tight">₹{item.price.toFixed(2)}</p>
                            </div>
                            <button onClick={() => handleRemoveItem(item._id)} className="text-slate-400 hover:text-rose-500 p-2 -mr-2 transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center bg-slate-50 rounded-full border border-slate-100 p-1">
                              <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all">
                                <Minus size={14} strokeWidth={3} />
                              </button>
                              <span className="w-10 text-center font-bold text-slate-900 text-sm">{item.quantity}</span>
                              <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm transition-all">
                                <Plus size={14} strokeWidth={3} />
                              </button>
                            </div>
                            <p className="font-black text-slate-900 text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.form key="checkout-form" onSubmit={handleSubmitOrder} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  
                  {/* Shipping Address */}
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">1</div> Shipping Details</h2>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Street Address</label>
                        <input type="text" name="street" value={shippingAddress.street} onChange={handleAddressChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
                          <input type="text" name="city" value={shippingAddress.city} onChange={handleAddressChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">State</label>
                          <input type="text" name="state" value={shippingAddress.state} onChange={handleAddressChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ZIP Code</label>
                          <input type="text" name="zipCode" value={shippingAddress.zipCode} onChange={handleAddressChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Country</label>
                          <input type="text" name="country" value={shippingAddress.country} onChange={handleAddressChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">2</div> Payment Method</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['Credit Card', 'PayPal', 'Cash on Delivery'].map((method) => (
                        <label key={method} className={cn("relative flex flex-col items-center p-5 cursor-pointer rounded-2xl border-2 transition-all", paymentMethod === method ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:border-slate-200 bg-white")}>
                          <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                          <CreditCard className={cn("mb-3", paymentMethod === method ? "text-blue-600" : "text-slate-400")} size={24} />
                          <span className={cn("text-sm font-bold text-center", paymentMethod === method ? "text-blue-900" : "text-slate-600")}>{method}</span>
                          {paymentMethod === method && <CheckCircle size={16} className="absolute top-3 right-3 text-blue-600" />}
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-slate-900 rounded-3xl shadow-2xl p-8 text-white sticky top-28">
              <h2 className="text-xl font-black mb-6 flex items-center justify-between">Order Summary <span className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full">{itemCount} Items</span></h2>
              
              <div className="space-y-4 mb-8 text-slate-300">
                <div className="flex justify-between items-center"><span className="text-sm">Subtotal</span><span className="font-medium text-white">{formattedSubtotal}</span></div>
                <div className="flex justify-between items-center"><span className="text-sm">Shipping</span><span className="font-medium text-white">Free</span></div>
                {couponApplied && (
                  <div className="flex justify-between items-center text-emerald-400"><span className="text-sm flex items-center gap-1.5"><Tag size={14}/> Discount ({couponCode.toUpperCase()})</span><span className="font-medium">-₹{discountAmount.toFixed(2)}</span></div>
                )}
                <div className="h-px bg-white/10 w-full my-4"></div>
                <div className="flex justify-between items-end"><span className="font-bold text-white">Total</span><span className="text-3xl font-black text-white">{formattedFinalTotal}</span></div>
              </div>

              {!checkoutMode ? (
                <div className="space-y-4">
                  <div className="bg-white/5 p-1 rounded-2xl flex border border-white/10 focus-within:border-white/30 transition-colors">
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Promo Code" disabled={couponApplied} className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none disabled:opacity-50" />
                    {!couponApplied ? (
                      <button type="button" onClick={handleApplyCoupon} className="bg-white text-slate-900 px-6 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Apply</button>
                    ) : (
                      <button type="button" onClick={handleRemoveCoupon} className="bg-rose-500/20 text-rose-400 px-6 rounded-xl text-sm font-bold hover:bg-rose-500/30 transition-colors">Remove</button>
                    )}
                  </div>
                  
                  <button onClick={handleCheckout} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                    Proceed to Checkout <ArrowRight size={18} />
                  </button>
                </div>
              ) : (
                <button onClick={handleSubmitOrder} disabled={processingOrder} className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-400 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  {processingOrder ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <><CheckCircle size={18} /> Confirm Order & Pay {formattedFinalTotal}</>}
                </button>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Cart;
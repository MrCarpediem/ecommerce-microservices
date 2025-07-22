import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useOrder } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, error: cartError, getCartTotals } = useCart();
  const { createOrder, loading: orderLoading, error: orderError } = useOrder();
  const { isAuthenticated, currentUser } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    paymentMethod: 'Credit Card',
    saveInfo: false
  });

  // Form validation state
  const [errors, setErrors] = useState({});
  
  // States for steps and animations
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Pre-fill email if user is logged in
  useEffect(() => {
    if (currentUser && currentUser.email) {
      setFormData(prevData => ({
        ...prevData,
        email: currentUser.email,
        firstName: currentUser?.firstName || '',
        lastName: currentUser?.lastName || '',
        street: currentUser?.address?.street || '',
        city: currentUser?.address?.city || '',
        state: currentUser?.address?.state || '',
        zipCode: currentUser?.address?.zipCode || '',
        country: currentUser?.address?.country || '',
      }));
    }
  }, [currentUser]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is being edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }
    
    if (checkoutStep === 2) {
      if (!formData.street.trim()) newErrors.street = 'Street address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP/Postal code is required';
      if (!formData.country.trim()) newErrors.country = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Navigate between checkout steps
  const handleNextStep = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      window.scrollTo(0, 0);
      setCheckoutStep(2);
    }
  };
  
  const handlePrevStep = () => {
    setCheckoutStep(1);
    window.scrollTo(0, 0);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setFormSubmitting(true);
    
    const shippingAddress = {
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country
    };
    
    try {
      const order = await createOrder(shippingAddress, formData.paymentMethod);
      
      if (order) {
        // Redirect to order confirmation page
        navigate(`/order-confirmation/${order._id}`);
      }
    } catch (error) {
      console.error("Order creation failed:", error);
    } finally {
      setFormSubmitting(false);
    }
  };
  
  // Get cart totals
  const { itemCount, subtotal, formattedSubtotal } = getCartTotals();
  
  // Calculate shipping, tax and total
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.07;
  const total = subtotal + shipping + tax;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md mx-auto shadow-lg">
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="mb-6 text-gray-700">Please sign in to your account to proceed with checkout.</p>
            </div>
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => navigate('/login', { state: { returnUrl: '/checkout' } })}
                className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-all duration-200 shadow-md"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register', { state: { returnUrl: '/checkout' } })}
                className="bg-white text-blue-600 border border-blue-600 py-3 px-6 rounded-md hover:bg-blue-50 transition-all duration-200"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show loading state
  if (cartLoading || orderLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mb-8"></div>
          <h1 className="text-3xl font-bold mb-3">Processing Your Order</h1>
          <p className="text-gray-600 text-lg">Please wait while we prepare your checkout...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (cartError || orderError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Checkout Error</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto shadow-lg">
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-700 mb-6 text-lg">{cartError || orderError}</p>
            <button 
              onClick={() => navigate(-1)} 
              className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-all duration-200 shadow-md"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show empty cart message
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Your Cart is Empty</h1>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto shadow-md">
            <div className="flex justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="mb-6 text-gray-700 text-lg">Your shopping cart is empty. Add some products to proceed with checkout.</p>
            <button 
              onClick={() => navigate('/products')} 
              className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-all duration-200 shadow-md"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center md:text-left">Checkout</h1>
        
        {/* Checkout Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12 px-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 z-0"></div>
            <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-500 z-0" style={{ width: checkoutStep === 1 ? '0%' : checkoutStep === 2 ? '50%' : '100%' }}></div>
            
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${checkoutStep >= 1 ? 'bg-blue-500' : 'bg-gray-300'}`}>
              1
            </div>
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${checkoutStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}>
              2
            </div>
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${checkoutStep >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`}>
              3
            </div>
          </div>
          
          <div className="flex justify-between mt-2 text-sm">
            <div className={`text-center w-24 ${checkoutStep >= 1 ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
              Customer Info
            </div>
            <div className={`text-center w-24 ${checkoutStep >= 2 ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
              Shipping
            </div>
            <div className={`text-center w-24 ${checkoutStep >= 3 ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
              Payment
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap -mx-4">
          {/* Checkout Form */}
          <div className="w-full lg:w-2/3 px-4 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-8 transition-all duration-300">
              {checkoutStep === 1 && (
                <div className="animate-fadeIn">
                  <h2 className="text-2xl font-semibold mb-6">Customer Information</h2>
                  
                  <form onSubmit={handleNextStep}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-gray-700 mb-2 font-medium" htmlFor="firstName">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          id="firstName" 
                          name="firstName" 
                          value={formData.firstName} 
                          onChange={handleChange} 
                          className={`w-full border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Your first name"
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2 font-medium" htmlFor="lastName">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          id="lastName" 
                          name="lastName" 
                          value={formData.lastName} 
                          onChange={handleChange} 
                          className={`w-full border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Your last name"
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="email" 
                          id="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleChange} 
                          className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="your.email@example.com" 
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button 
                        type="submit" 
                        className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 transition-all duration-200 shadow-md flex items-center"
                      >
                        <span>Continue to Shipping</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {checkoutStep === 2 && (
                <div className="animate-fadeIn">
                  <h2 className="text-2xl font-semibold mb-6">Shipping & Payment</h2>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Shipping Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-gray-700 mb-2 font-medium" htmlFor="street">
                            Street Address <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text" 
                            id="street" 
                            name="street" 
                            value={formData.street} 
                            onChange={handleChange} 
                            className={`w-full border ${errors.street ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="123 Main St" 
                          />
                          {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2 font-medium" htmlFor="city">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text" 
                            id="city" 
                            name="city" 
                            value={formData.city} 
                            onChange={handleChange} 
                            className={`w-full border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="New York" 
                          />
                          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2 font-medium" htmlFor="state">
                            State/Province <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text" 
                            id="state" 
                            name="state" 
                            value={formData.state} 
                            onChange={handleChange} 
                            className={`w-full border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="NY" 
                          />
                          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2 font-medium" htmlFor="zipCode">
                            ZIP/Postal Code <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text" 
                            id="zipCode" 
                            name="zipCode" 
                            value={formData.zipCode} 
                            onChange={handleChange} 
                            className={`w-full border ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="10001" 
                          />
                          {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2 font-medium" htmlFor="country">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text" 
                            id="country" 
                            name="country" 
                            value={formData.country} 
                            onChange={handleChange} 
                            className={`w-full border ${errors.country ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="United States" 
                          />
                          {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="flex items-center">
                          <input 
                            type="checkbox" 
                            name="saveInfo" 
                            checked={formData.saveInfo} 
                            onChange={handleChange} 
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                          />
                          <span className="ml-2 text-gray-700">Save this information for next time</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Payment Method</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <label className={`border rounded-md p-4 flex items-center cursor-pointer transition-all ${formData.paymentMethod === 'Credit Card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
                          <input 
                            type="radio" 
                            id="creditCard" 
                            name="paymentMethod" 
                            value="Credit Card" 
                            checked={formData.paymentMethod === 'Credit Card'} 
                            onChange={handleChange} 
                            className="h-5 w-5 text-blue-600" 
                          />
                          <div className="ml-3">
                            <span className="text-gray-900 font-medium">Credit Card</span>
                            <p className="text-gray-500 text-sm">Pay securely with your credit card</p>
                          </div>
                          <div className="ml-auto flex space-x-2">
                            <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center">
                              <span className="text-xs font-semibold text-gray-700">VISA</span>
                            </div>
                            <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center">
                              <span className="text-xs font-semibold text-gray-700">MC</span>
                            </div>
                          </div>
                        </label>
                        
                        <label className={`border rounded-md p-4 flex items-center cursor-pointer transition-all ${formData.paymentMethod === 'PayPal' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
                          <input 
                            type="radio" 
                            id="paypal" 
                            name="paymentMethod" 
                            value="PayPal" 
                            checked={formData.paymentMethod === 'PayPal'} 
                            onChange={handleChange} 
                            className="h-5 w-5 text-blue-600" 
                          />
                          <div className="ml-3">
                            <span className="text-gray-900 font-medium">PayPal</span>
                            <p className="text-gray-500 text-sm">Pay using your PayPal account</p>
                          </div>
                          <div className="ml-auto">
                            <div className="h-8 w-16 bg-gray-100 rounded flex items-center justify-center">
                              <span className="text-xs font-semibold text-blue-700">PayPal</span>
                            </div>
                          </div>
                        </label>
                        
                        <label className={`border rounded-md p-4 flex items-center cursor-pointer transition-all ${formData.paymentMethod === 'Cash on Delivery' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
                          <input 
                            type="radio" 
                            id="cod" 
                            name="paymentMethod" 
                            value="Cash on Delivery" 
                            checked={formData.paymentMethod === 'Cash on Delivery'} 
                            onChange={handleChange} 
                            className="h-5 w-5 text-blue-600" 
                          />
                          <div className="ml-3">
                            <span className="text-gray-900 font-medium">Cash on Delivery</span>
                            <p className="text-gray-500 text-sm">Pay with cash upon delivery</p>
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <button 
                        type="button" 
                        onClick={handlePrevStep} 
                        className="bg-white text-gray-700 border border-gray-300 py-3 px-6 rounded-md hover:bg-gray-50 transition-all duration-200 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Back</span>
                      </button>
                      <button 
                        type="submit" 
                        className="bg-green-600 text-white py-3 px-8 rounded-md hover:bg-green-700 transition-all duration-200 shadow-md flex items-center"
                        disabled={formSubmitting}
                      >
                        {formSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>Place Order</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="w-full lg:w-1/3 px-4">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-200">Order Summary</h2>
              
              <div className="mb-6">
                <div className="max-h-96 overflow-y-auto mb-4">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex items-center py-4 border-b border-gray-100">
                      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-grow">
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                        {item.color && (
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500 mr-2">Color:</span>
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-200" 
                              style={{ backgroundColor: item.color }}
                              title={item.color}
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Secure checkout</span>
                </div>
                <div className="flex items-center mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

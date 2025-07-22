
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrder } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';

const Order = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { orders, loading, error, fetchOrders, fetchOrderById, cancelOrder } = useOrder();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced order fetching with proper loading states
  useEffect(() => {
    const getOrders = async () => {
      setIsLoading(true);
      if (isAuthenticated) {
        try {
          await fetchOrders();
        } catch (err) {
          console.error("Failed to fetch orders:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    getOrders();
  }, [isAuthenticated, fetchOrders]);

  const handleViewOrderDetails = async (orderId) => {
    try {
      setIsLoading(true);
      const orderDetails = await fetchOrderById(orderId);
      if (orderDetails) {
        setSelectedOrder(orderDetails);
      }
    } catch (err) {
      console.error("Failed to fetch order details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        setIsLoading(true);
        await cancelOrder(orderId);
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(null);
        }
        await fetchOrders(); // Refresh orders list
      } catch (err) {
        console.error("Failed to cancel order:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'processing': 'bg-blue-100 text-blue-800 border border-blue-200',
      'shipped': 'bg-purple-100 text-purple-800 border border-purple-200',
      'delivered': 'bg-green-100 text-green-800 border border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border border-red-200'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
        {status}
      </span>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-600 p-6 text-center">
              <h1 className="text-3xl font-bold text-white">Your Orders</h1>
            </div>
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="mb-6 text-gray-700 text-lg">Please sign in to view your order history</p>
              <Link to="/login" className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-300 inline-block font-medium shadow-md">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-600 p-6">
              <h1 className="text-3xl font-bold text-white text-center">Your Orders</h1>
            </div>
            <div className="p-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                <p className="mt-6 text-gray-600 text-lg">Loading your orders...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-red-600 p-6">
              <h1 className="text-3xl font-bold text-white text-center">Your Orders</h1>
            </div>
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium text-lg mb-2">Error Loading Orders</p>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={fetchOrders} 
                className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-300 inline-block font-medium shadow-md"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-600 p-6">
              <h1 className="text-3xl font-bold text-white text-center">Your Orders</h1>
            </div>
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
              </div>
              <p className="mb-6 text-xl text-gray-700">You haven't placed any orders yet</p>
              <p className="mb-8 text-gray-500">Start shopping to see your orders here</p>
              <Link to="/products" className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-300 inline-block font-medium shadow-md">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg mb-8 p-6">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white">Your Orders</h1>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h2 className="font-semibold text-lg text-gray-800">Order History</h2>
                </div>
                <div className="divide-y max-h-[500px] overflow-y-auto">
                  {orders.map((order) => (
                    <div 
                      key={order._id} 
                      className={`p-4 cursor-pointer transition duration-200 hover:bg-blue-50 ${selectedOrder && selectedOrder._id === order._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                      onClick={() => handleViewOrderDetails(order._id)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-blue-900">
                          #{order._id.substring(order._id.length - 8).toUpperCase()}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-sm font-medium text-gray-900">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-sm font-semibold text-blue-800">
                          ${order.totalAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Order Details */}
            <div className="lg:col-span-2">
              {selectedOrder ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-5 bg-gradient-to-r from-gray-50 to-blue-50 border-b flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Order ID</div>
                      <h2 className="font-bold text-xl text-gray-800">
                        #{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}
                      </h2>
                    </div>
                    <div className="flex gap-2">
                      {selectedOrder.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(selectedOrder._id)}
                          className="bg-red-50 text-red-600 py-2 px-4 rounded-lg text-sm hover:bg-red-100 transition duration-300 font-medium border border-red-200 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel Order
                        </button>
                      )}
                      <button className="bg-blue-50 text-blue-600 py-2 px-4 rounded-lg text-sm hover:bg-blue-100 transition duration-300 font-medium border border-blue-200 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print Receipt
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Order Status Timeline */}
                    <div className="mb-8">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className={`h-3 w-3 rounded-full ${
                          ['pending', 'processing', 'shipped', 'delivered'].includes(selectedOrder.status.toLowerCase()) 
                            ? 'bg-blue-600' : 'bg-gray-300'
                        }`}></div>
                        <div className={`h-0.5 flex-grow ${
                          ['processing', 'shipped', 'delivered'].includes(selectedOrder.status.toLowerCase()) 
                            ? 'bg-blue-600' : 'bg-gray-200'
                        }`}></div>
                        <div className={`h-3 w-3 rounded-full ${
                          ['processing', 'shipped', 'delivered'].includes(selectedOrder.status.toLowerCase()) 
                            ? 'bg-blue-600' : 'bg-gray-300'
                        }`}></div>
                        <div className={`h-0.5 flex-grow ${
                          ['shipped', 'delivered'].includes(selectedOrder.status.toLowerCase()) 
                            ? 'bg-blue-600' : 'bg-gray-200'
                        }`}></div>
                        <div className={`h-3 w-3 rounded-full ${
                          ['shipped', 'delivered'].includes(selectedOrder.status.toLowerCase()) 
                            ? 'bg-blue-600' : 'bg-gray-300'
                        }`}></div>
                        <div className={`h-0.5 flex-grow ${
                          ['delivered'].includes(selectedOrder.status.toLowerCase()) 
                            ? 'bg-blue-600' : 'bg-gray-200'
                        }`}></div>
                        <div className={`h-3 w-3 rounded-full ${
                          ['delivered'].includes(selectedOrder.status.toLowerCase()) 
                            ? 'bg-blue-600' : 'bg-gray-300'
                        }`}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <div className="w-1/4 text-center">Confirmed</div>
                        <div className="w-1/4 text-center">Processing</div>
                        <div className="w-1/4 text-center">Shipped</div>
                        <div className="w-1/4 text-center">Delivered</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Order Information
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Status:</span>
                            <span>{getStatusBadge(selectedOrder.status)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Order Date:</span>
                            <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="font-medium flex items-center">
                              {selectedOrder.paymentMethod === 'Credit Card' && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                              )}
                              {selectedOrder.paymentMethod}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-bold text-blue-800">${selectedOrder.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Shipping Address
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <div className="font-medium mb-2 text-blue-800">{selectedOrder.shippingAddress.name || 'Customer Name'}</div>
                          <p className="text-gray-700">{selectedOrder.shippingAddress.street}</p>
                          <p className="text-gray-700">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                          <p className="text-gray-700">{selectedOrder.shippingAddress.country}</p>
                          {selectedOrder.shippingAddress.phone && (
                            <p className="text-gray-700 mt-2">Phone: {selectedOrder.shippingAddress.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Order Items
                    </h3>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedOrder.items.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {item.imageUrl ? (
                                      <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-md object-cover mr-4" />
                                    ) : (
                                      <div className="h-16 w-16 bg-gray-100 rounded-md mr-4 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-medium text-gray-900">{item.name}</div>
                                      {item.variant && <div className="text-sm text-gray-500">{item.variant}</div>}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700">${item.price.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className="px-3 py-1 inline-flex text-sm leading-5 font-medium bg-gray-100 text-gray-800 rounded-full">
                                    {item.quantity}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-medium">${(item.price * item.quantity).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-50">
                              <td colSpan="3" className="px-6 py-4 text-right font-medium text-gray-700">Subtotal:</td>
                              <td className="px-6 py-4 text-right font-medium text-gray-900">${selectedOrder.totalAmount.toFixed(2)}</td>
                            </tr>
                            {selectedOrder.shippingCost && (
                              <tr className="bg-gray-50">
                                <td colSpan="3" className="px-6 py-4 text-right font-medium text-gray-700">Shipping:</td>
                                <td className="px-6 py-4 text-right font-medium text-gray-900">${selectedOrder.shippingCost.toFixed(2)}</td>
                              </tr>
                            )}
                            {selectedOrder.tax && (
                              <tr className="bg-gray-50">
                                <td colSpan="3" className="px-6 py-4 text-right font-medium text-gray-700">Tax:</td>
                                <td className="px-6 py-4 text-right font-medium text-gray-900">${selectedOrder.tax.toFixed(2)}</td>
                              </tr>
                            )}
                            <tr className="bg-blue-50">
                              <td colSpan="3" className="px-6 py-4 text-right font-bold text-blue-800">Total:</td>
                              <td className="px-6 py-4 text-right font-bold text-blue-800">${selectedOrder.totalAmount.toFixed(2)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-10 text-center h-full flex flex-col items-center justify-center">
                  <div className="bg-blue-50 p-6 rounded-full inline-block mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">No Order Selected</h3>
                  <p className="text-gray-500 mb-6">Select an order from the list to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;

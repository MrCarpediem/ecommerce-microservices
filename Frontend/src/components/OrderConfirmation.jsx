
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../contexts/OrderContext';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { fetchOrderById, currentOrder, loading, error } = useOrder();
  const [orderFetched, setOrderFetched] = useState(false);
  
  useEffect(() => {
    
    if (orderId && !orderFetched) {
      fetchOrderById(orderId);
      setOrderFetched(true);
    }
  }, [orderId, fetchOrderById, orderFetched]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        <div className="max-w-3xl mx-auto w-full px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Order</h1>
            <div className="flex justify-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600"></div>
            </div>
            <p className="mt-6 text-gray-600 text-lg">Retrieving your order details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Confirmation</h1>
            <div className="h-1 w-24 bg-red-500 mx-auto"></div>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-xl mx-auto">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Something Went Wrong</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <Link to="/orders" className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md">
                View My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Confirmation</h1>
            <div className="h-1 w-24 bg-gray-300 mx-auto"></div>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-xl mx-auto">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Not Found</h2>
              <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
              <Link to="/orders" className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md">
                View My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const { _id, items, totalAmount, shippingAddress, paymentMethod, orderStatus, createdAt } = currentOrder;
  const orderDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Calculate order summary
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // You can modify this if you have shipping cost data
  const tax = subtotal * 0.07; // Assuming 7% tax, adjust as needed
  
  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Banner */}
        <div className="bg-white border-l-4 border-green-500 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-2 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Order Confirmed!</h1>
              <p className="text-gray-600">
                Thanks for your purchase. Order #{_id.slice(-6)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Order Status Tracking */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Order Status</h2>
          <div className="relative">
            <div className="absolute left-0 top-0 ml-4 h-full border-l-2 border-gray-200"></div>
            <div className={`relative flex items-center mb-8 ${orderStatus === 'Processing' || orderStatus === 'Shipped' || orderStatus === 'Delivered' ? 'text-green-600' : 'text-gray-500'}`}>
              <div className={`absolute -left-1 w-6 h-6 rounded-full flex items-center justify-center ${orderStatus === 'Processing' || orderStatus === 'Shipped' || orderStatus === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-8">
                <h3 className="font-medium">Order Placed</h3>
                <p className="text-sm text-gray-500">{orderDate}</p>
              </div>
            </div>
            <div className={`relative flex items-center mb-8 ${orderStatus === 'Shipped' || orderStatus === 'Delivered' ? 'text-green-600' : 'text-gray-500'}`}>
              <div className={`absolute -left-1 w-6 h-6 rounded-full flex items-center justify-center ${orderStatus === 'Shipped' || orderStatus === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}>
                {orderStatus === 'Shipped' || orderStatus === 'Delivered' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-white text-xs">2</span>
                )}
              </div>
              <div className="ml-8">
                <h3 className="font-medium">Processing</h3>
                <p className="text-sm text-gray-500">Order is being prepared</p>
              </div>
            </div>
            <div className={`relative flex items-center mb-8 ${orderStatus === 'Delivered' ? 'text-green-600' : 'text-gray-500'}`}>
              <div className={`absolute -left-1 w-6 h-6 rounded-full flex items-center justify-center ${orderStatus === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}>
                {orderStatus === 'Delivered' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-white text-xs">3</span>
                )}
              </div>
              <div className="ml-8">
                <h3 className="font-medium">Shipped</h3>
                <p className="text-sm text-gray-500">Your order is on the way</p>
              </div>
            </div>
            <div className="relative flex items-center text-gray-500">
              <div className={`absolute -left-1 w-6 h-6 rounded-full flex items-center justify-center ${orderStatus === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}>
                {orderStatus === 'Delivered' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-white text-xs">4</span>
                )}
              </div>
              <div className="ml-8">
                <h3 className="font-medium">Delivered</h3>
                <p className="text-sm text-gray-500">Enjoy your purchase!</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b">
            <div>
              <h3 className="text-gray-500 uppercase text-sm tracking-wider mb-2">Shipping Address</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium">{shippingAddress.fullName || 'Customer'}</p>
                <p>{shippingAddress.street}</p>
                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                <p>{shippingAddress.country}</p>
                {shippingAddress.phone && <p className="mt-2">Phone: {shippingAddress.phone}</p>}
              </div>
            </div>
            
            <div>
              <h3 className="text-gray-500 uppercase text-sm tracking-wider mb-2">Order Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">#{_id.slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{orderDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="capitalize">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    orderStatus === 'Processing' ? 'bg-blue-100 text-blue-800' :
                    orderStatus === 'Shipped' ? 'bg-yellow-100 text-yellow-800' :
                    orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {orderStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="p-6">
            <h3 className="text-gray-500 uppercase text-sm tracking-wider mb-4">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.image && (
                            <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded overflow-hidden mr-4">
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            {item.variant && <div className="text-sm text-gray-500">{item.variant}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        ${(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Order Summary */}
            <div className="mt-8 border-t pt-6">
              <div className="flex justify-end">
                <div className="w-full md:w-64">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-800">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="text-gray-800">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-gray-800">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-medium text-lg">Total:</span>
                    <span className="font-bold text-lg">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/orders" className="inline-flex items-center justify-center bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View All Orders
          </Link>
          <Link to="/" className="inline-flex items-center justify-center bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

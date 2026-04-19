import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserOrders, cancelOrder } from '../services/orderService';
import { formatPrice, formatDate } from '../utils/formatters';
import Loader from '../components/Loader';

const statusColors = {
  Processing: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800'
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getUserOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await cancelOrder(orderId);
      loadOrders();
    } catch (err) {
      alert('Failed to cancel order');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <button onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order ID</p>
                    <p className="font-mono text-sm font-medium text-gray-800">{order._id}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.orderStatus] || 'bg-gray-100'}`}>
                    {order.orderStatus}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items.slice(0, 2).map(item => (
                    <div key={item._id} className="flex justify-between text-sm text-gray-600">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-gray-500">+{order.items.length - 2} more items</p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <span className="text-gray-600 text-sm">Total: </span>
                    <span className="font-bold text-blue-600 text-lg">{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="flex gap-3">
                    {['Processing', 'Confirmed'].includes(order.orderStatus) && (
                      <button onClick={() => handleCancel(order._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition">
                        Cancel
                      </button>
                    )}
                    <button onClick={() => navigate(`/orders/${order._id}`)}
                      className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
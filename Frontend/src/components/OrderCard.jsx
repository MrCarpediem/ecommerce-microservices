import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatDate } from '../utils/formatters';

const statusColors = {
  Processing: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800'
};

const OrderCard = ({ order }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer"
      onClick={() => navigate(`/orders/${order._id}`)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500">Order ID</p>
          <p className="font-mono text-sm font-medium">{order._id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.orderStatus] || 'bg-gray-100'}`}>
          {order.orderStatus}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-gray-500 text-sm">{formatDate(order.createdAt)}</p>
        <p className="font-bold text-blue-600">{formatPrice(order.totalAmount)}</p>
      </div>
    </div>
  );
};

export default OrderCard;
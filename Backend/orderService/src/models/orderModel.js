const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  imageUrl: { type: String, default: '' }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true, min: 0 },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Credit Card', 'Debit Card', 'UPI', 'Cash on Delivery', 'PayPal']
  },
  paymentStatus: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Completed', 'Failed', 'Refunded']
  },
  orderStatus: {
    type: String,
    default: 'Processing',
    enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']
  },
  cancelledAt: { type: Date },
  deliveredAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
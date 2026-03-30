const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  image: { type: String, default: '' }
}, { _id: true });

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    index: true
  },
  items: [CartItemSchema]
}, { timestamps: true });

CartSchema.virtual('total').get(function () {
  return parseFloat(
    this.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );
});

CartSchema.virtual('itemCount').get(function () {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

CartSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Cart', CartSchema);
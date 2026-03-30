const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  resource: { type: String, required: true }, // e.g. 'products', 'orders'
  actions: [{ type: String, enum: ['create', 'read', 'update', 'delete'] }]
}, { _id: false });

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['customer', 'seller', 'moderator', 'admin']
  },
  permissions: [permissionSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
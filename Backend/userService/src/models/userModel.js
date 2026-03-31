const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'home' }, // home, work, other
  street: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  zipCode: { type: String, default: '' },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  firstName: { type: String, default: '', trim: true },
  lastName: { type: String, default: '', trim: true },
  phoneNumber: {
    type: String,
    default: '',
    match: [/^[0-9]{10}$/, 'Invalid phone number']
  },
  avatar: { type: String, default: '' },
  addresses: [addressSchema],
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'en' }
  }
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);
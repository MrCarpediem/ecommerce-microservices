const mongoose = require('mongoose');
const Role = require('../src/models/Role');
require('dotenv').config();

const roles = [
  {
    name: 'customer',
    permissions: [
      { resource: 'products', actions: ['read'] },
      { resource: 'orders', actions: ['create', 'read'] },
      { resource: 'cart', actions: ['create', 'read', 'update', 'delete'] }
    ]
  },
  {
    name: 'seller',
    permissions: [
      { resource: 'products', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'orders', actions: ['read', 'update'] }
    ]
  },
  {
    name: 'moderator',
    permissions: [
      { resource: 'products', actions: ['read', 'update', 'delete'] },
      { resource: 'orders', actions: ['read', 'update'] },
      { resource: 'users', actions: ['read', 'update'] }
    ]
  },
  {
    name: 'admin',
    permissions: [] // admin bypasses all checks
  }
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/auth-service');
  await Role.deleteMany({});
  await Role.insertMany(roles);
  console.log('✅ Roles seeded successfully');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
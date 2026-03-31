const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/user-service';

    mongoose.connection.on('connected', () => logger.info('MongoDB Connected - User Service'));
    mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB Disconnected'));

    await mongoose.connect(mongoUri);
  } catch (err) {
    logger.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
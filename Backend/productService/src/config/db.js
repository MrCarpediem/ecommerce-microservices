const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async (retryCount = 0) => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/product-service';
    
    await mongoose.connect(mongoUri);



    logger.info('MongoDB Connected - Product Service');

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB Disconnected. Attempting to reconnect...');
      setTimeout(() => connectDB(), 5000);
    });

  } catch (err) {
    logger.error(`MongoDB connection failed (Attempt ${retryCount + 1}): ${err.message}`); console.error("Full Error:", err);
    if (retryCount < 20) {
      logger.info('Retrying connection in 5s...');
      setTimeout(() => connectDB(retryCount + 1), 5000);
    } else {
      logger.error('Max retries reached for MongoDB. Exiting...');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
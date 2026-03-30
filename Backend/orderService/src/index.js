const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const routes = require('./routes/orderRoutes');
const { registerService } = require('./utils/serviceRegistry');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5005;
const SERVICE_URL = process.env.SERVICE_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(limiter);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/order-service', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

connectDB();

app.use('/api/orders', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'Order service is running' });
});

const server = app.listen(PORT, async () => {
  console.log(`Order service running on port ${PORT}`);
  
  try {
    await registerService('order', SERVICE_URL, {
      getOrders: '/api/orders',
      createOrder: '/api/orders',
      getOrderById: '/api/orders/:id'
    });
    console.log('Successfully registered with service registry');
  } catch (error) {
    console.error('Failed to register with service registry:', error.message);
  }
});

const gracefulShutdown = () => {
  console.log('Gracefully shutting down order service');
  server.close(() => process.exit(0));
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
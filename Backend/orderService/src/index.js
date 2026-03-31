const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const orderRoutes = require('./routes/orderRoutes');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5005;
const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:5000';
const SERVICE_URL = process.env.SERVICE_URL || `http://localhost:${PORT}`;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests.' }
});

connectDB();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use('/api/orders', limiter);
app.use('/api/orders', orderRoutes);

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong.' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, async () => {
  logger.info(`Order service running on port ${PORT}`);
  try {
    await axios.post(`${REGISTRY_URL}/register`, {
      name: 'order',
      url: SERVICE_URL,
      endpoints: {
        getOrders: '/api/orders',
        createOrder: '/api/orders',
        getOrderById: '/api/orders/:id',
        cancelOrder: '/api/orders/:id/cancel',
        updateStatus: '/api/orders/:id/status',
        adminAllOrders: '/api/orders/admin/all'
      }
    });
    logger.info('Order service registered with service registry.');
  } catch (err) {
    logger.warn('Could not register with service registry:', err.message);
  }
});

const gracefulShutdown = () => {
  logger.info('Gracefully shutting down order service...');
  server.close(() => process.exit(0));
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
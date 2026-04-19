const dns = require("dns"); dns.setDefaultResultOrder("ipv4first");
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:5000';
const SERVICE_URL = process.env.SERVICE_URL || `http://localhost:${PORT}`;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

connectDB();

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use('/api/auth', limiter);
app.use('/api/auth', authRoutes);

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong.' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
  logger.info(`Auth service running on port ${PORT}`);
  
  const registerService = async (retryCount = 0) => {
    try {
      await axios.post(`${REGISTRY_URL}/register`, {
        name: 'auth',
        url: SERVICE_URL,
        endpoints: {
          login: '/api/auth/login',
          register: '/api/auth/register',
          refresh: '/api/auth/refresh',
          logout: '/api/auth/logout',
          validateToken: '/api/auth/validate-token',
          me: '/api/auth/me'
        }
      });
      logger.info('Auth service registered with service registry.');
    } catch (err) {
      logger.warn(`Could not register with service registry. Retrying in 5s... (${err.message})`);
      if (retryCount < 5) {
        setTimeout(() => registerService(retryCount + 1), 5000);
      } else {
        logger.error('Failed to register with service registry after 5 attempts.');
      }
    }
  };
  
  registerService();
});

const gracefulShutdown = () => {
  logger.info('Gracefully shutting down...');
  server.close(() => process.exit(0));
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
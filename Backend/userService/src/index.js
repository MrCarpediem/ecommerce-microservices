const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5002;
const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:5000';
const SERVICE_URL = process.env.SERVICE_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

connectDB();

app.use(helmet());
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(limiter);

app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'User service is running' });
});

const server = app.listen(PORT, async () => {
  console.log(`User service running on port ${PORT}`);

  try {
    await axios.post(`${REGISTRY_URL}/register`, {
      name: 'user',
      url: SERVICE_URL,
      endpoints: {
        getProfile: '/api/users/profile',
        updateProfile: '/api/users/profile'
      }
    });
    console.log('✅ Successfully registered user service with the service registry.');
  } catch (err) {
    console.error('❌ Failed to register with service registry:', err.message);
  }
});

const gracefulShutdown = () => {
  console.log('Gracefully shutting down user service');
  server.close(() => process.exit(0));
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

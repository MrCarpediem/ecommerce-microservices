const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const logger = require('./utils/logger');
const { authenticate } = require('./middleware/auth');
const { globalLimiter, authLimiter } = require('./middleware/rateLimiter');
const { requestLogger } = require('./middleware/logger');
const routes = require('./config/routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5006;

// Security middlewares
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(globalLimiter);
app.use(requestLogger);

// Auth rate limiter for login/register
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// JWT Authentication check
app.use(authenticate);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Services health check — check all services
app.get('/health/services', async (req, res) => {
  const serviceChecks = await Promise.allSettled(
    Object.entries(routes).map(async ([name, config]) => {
      try {
        const response = await axios.get(`${config.target}/health`, { timeout: 3000 });
        return { name, status: 'up', data: response.data };
      } catch {
        return { name, status: 'down' };
      }
    })
  );

  const results = serviceChecks.map(r => r.value);
  const allUp = results.every(r => r.status === 'up');

  res.status(allUp ? 200 : 207).json({
    gateway: 'up',
    services: results
  });
});

// Proxy all routes to respective services
Object.entries(routes).forEach(([name, config]) => {
  app.use(
    createProxyMiddleware({
      target: config.target,
      changeOrigin: true,
      pathFilter: config.prefix,
      on: {
        error: (err, req, res) => {
          logger.error(`Proxy error for ${name}:`, err.message);
          if (!res.headersSent) {
            res.status(503).json({ error: `${name} service unavailable.` });
          }
        },
        proxyReq: (proxyReq, req) => {
          logger.info(`Proxying ${req.method} ${req.originalUrl} → ${name}`);
        }
      }
    })
  );
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong.' });
});

const server = app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info(`Proxying routes:`);
  Object.entries(routes).forEach(([name, config]) => {
    logger.info(`  ${config.prefix} → ${config.target}`);
  });
});

const gracefulShutdown = () => {
  logger.info('Gracefully shutting down API Gateway...');
  server.close(() => process.exit(0));
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
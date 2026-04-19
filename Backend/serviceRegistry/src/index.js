const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const logger = require('./logger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory registry
const registry = {};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests.' }
});

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(limiter);

// Register a service
app.post('/register', (req, res) => {
  const { name, url, endpoints } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: 'Service name and URL are required.' });
  }

  registry[name] = {
    url,
    endpoints: endpoints || {},
    registeredAt: new Date().toISOString(),
    status: 'up'
  };

  logger.info(`Service registered: ${name} at ${url}`);
  res.json({ message: `${name} registered successfully`, service: registry[name] });
});

// Get a specific service
app.get('/service/:name', (req, res) => {
  const { name } = req.params;
  if (!registry[name]) {
    return res.status(404).json({ error: `Service '${name}' not found.` });
  }
  res.json(registry[name]);
});

// Get all services
app.get('/services', (req, res) => {
  res.json(registry);
});

// Health check — also shows all registered services
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'service-registry',
    timestamp: new Date().toISOString(),
    registeredServices: Object.keys(registry)
  });
});

// Deregister a service
app.delete('/service/:name', (req, res) => {
  const { name } = req.params;
  if (!registry[name]) {
    return res.status(404).json({ error: `Service '${name}' not found.` });
  }
  delete registry[name];
  logger.info(`Service deregistered: ${name}`);
  res.json({ message: `${name} deregistered successfully.` });
});

// Proxy — forward request to a service
app.post('/proxy/:service', async (req, res) => {
  const { service } = req.params;
  const { method = 'GET', path, data, headers } = req.body;

  if (!registry[service]) {
    return res.status(404).json({ error: `Service '${service}' not found.` });
  }

  try {
    const fullUrl = `${registry[service].url}${path}`;
    const response = await axios({ method, url: fullUrl, data, headers });
    res.json(response.data);
  } catch (error) {
    logger.error(`Proxy error for ${service}:`, error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong.' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Service registry running on port ${PORT}`);
});

const gracefulShutdown = () => {
  logger.info('Gracefully shutting down service registry...');
  server.close(() => process.exit(0));
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
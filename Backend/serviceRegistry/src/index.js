const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(limiter);

const serviceRegistry = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
    endpoints: {
      validateToken: '/api/auth/validate-token',
      getUserInfo: '/api/auth/user'
    }
  },
  user: {
    url: process.env.USER_SERVICE_URL || 'http://localhost:5002',
    endpoints: {
      getUser: '/api/users'
    }
  },
  product: {
    url: process.env.PRODUCT_SERVICE_URL || 'http://localhost:5003',
    endpoints: {
      getProducts: '/api/products'
    }
  },
  cart: {
    url: process.env.CART_SERVICE_URL || 'http://localhost:5004',
    endpoints: {
      getCarts: '/api/carts'
    }
  },
  order: {
    url: process.env.ORDER_SERVICE_URL || 'http://localhost:5005',
    endpoints: {
      getOrders: '/api/orders'
    }
  }
};

app.get('/service/:name', (req, res) => {
  const { name } = req.params;

  if (serviceRegistry[name]) {
    return res.json(serviceRegistry[name]);
  }

  return res.status(404).json({ error: 'Service not found' });
});

app.get('/services', (req, res) => {
  return res.json(serviceRegistry);
});

app.post('/proxy/:service/:endpoint', async (req, res) => {
  const { service, endpoint } = req.params;
  const { method = 'GET', url, data, headers } = req.body;

  if (!serviceRegistry[service]) {
    return res.status(404).json({ error: 'Service not found' });
  }

  try {
    const serviceUrl = serviceRegistry[service].url;
    const fullUrl = url ? `${serviceUrl}${url}` : `${serviceUrl}/${endpoint}`;

    const response = await require('axios')({
      method,
      url: fullUrl,
      data,
      headers
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    return res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'Service registry is running' });
});

app.post('/register', (req, res) => {
  const { name, url, endpoints } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: 'Service name and URL are required' });
  }

  serviceRegistry[name] = {
    url,
    endpoints: endpoints || {}
  };

  return res.json({ message: `Service ${name} registered successfully`, service: serviceRegistry[name] });
});

const server = app.listen(PORT, () => {
  console.log(`Service registry running on port ${PORT}`);
});

const gracefulShutdown = () => {
  console.log('Gracefully shutting down service registry');
  server.close(() => process.exit(0));
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

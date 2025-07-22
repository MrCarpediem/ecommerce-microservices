// auth-service/src/index.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Auth service is running' });
});

// Start the server
// Start the server
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
  
  // Register with service registry
  const axios = require('axios');
  const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:5000';
  
  axios.post(`${REGISTRY_URL}/register`, {
    name: 'auth',
    url: `http://localhost:${PORT}`,
    endpoints: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      validateToken: '/api/auth/validate-token',
      getUserInfo: '/api/auth/user'
    }
  })
  .then(() => {
    console.log('✅ Successfully registered auth service with the service registry.');
  })
  .catch(err => {
    console.log('❌ Failed to register with service registry:', err.message);
  });
});

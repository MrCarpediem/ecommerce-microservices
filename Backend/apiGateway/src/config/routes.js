// All service routes mapping
const routes = {
  auth: {
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
    prefix: '/api/auth',
    public: ['/api/auth/login', '/api/auth/register', '/api/auth/refresh']
  },
  user: {
    target: process.env.USER_SERVICE_URL || 'http://localhost:5002',
    prefix: '/api/users',
    public: []
  },
  product: {
    target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:5003',
    prefix: '/api/products',
    public: ['/api/products'] // GET products is public
  },
  cart: {
    target: process.env.CART_SERVICE_URL || 'http://localhost:5004',
    prefix: '/api/cart',
    public: []
  },
  order: {
    target: process.env.ORDER_SERVICE_URL || 'http://localhost:5005',
    prefix: '/api/orders',
    public: []
  }
};

module.exports = routes;
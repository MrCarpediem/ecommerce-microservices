import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { UserProvider } from './contexts/UserContext';
import { OrderProvider } from './contexts/OrderContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import Order from './pages/Order';
import Orders from './pages/Orders';
import OrderConfirmation from './components/OrderConfirmation';
import Product from './pages/Product';
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <OrderProvider>
              <UserProvider>
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Navbar />
                  <main className="flex-grow">
                    <Routes>
                      {/* Public */}
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/products" element={<Product />} />
                      <Route path="/products/:id" element={<ProductDetail />} />

                      {/* Protected */}
                      <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                      <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                      <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                      <Route path="/orders/:id" element={<PrivateRoute><Order /></PrivateRoute>} />
                      <Route path="/order-confirmation/:orderId" element={<PrivateRoute><OrderConfirmation /></PrivateRoute>} />

                      {/* Role based */}
                      <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
                      <Route path="/seller" element={<PrivateRoute roles={['seller', 'admin']}><SellerDashboard /></PrivateRoute>} />

                      {/* 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </UserProvider>
            </OrderProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
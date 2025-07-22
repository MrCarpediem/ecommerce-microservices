import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaCreditCard, FaPaypal, FaApplePay, FaGooglePay } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      {/* Newsletter signup */}
      <div className="bg-blue-900 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Subscribe to our newsletter</h3>
              <p className="text-blue-200 text-sm">Get updates on new products and exclusive offers</p>
            </div>
            <div className="w-full md:w-auto">
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800"
                />
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-600 transition-colors px-4 py-2 rounded-r-md font-medium"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Shop Info */}
          <div>
            <Link to="/" className="text-2xl font-bold flex items-center mb-4">
              <span className="bg-white text-blue-700 rounded-lg px-2 py-1 mr-1">Shop</span>
              <span>Ease</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Your one-stop shop for everything. Quality products, amazing deals, and fast delivery.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebookF size={18} />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter size={18} />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram size={18} />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedinIn size={18} />
              </a>
            </div>
          </div>

          {/* Shopping */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Shop</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=clothing" className="hover:text-white transition-colors">Clothing</Link></li>
              <li><Link to="/products?category=home" className="hover:text-white transition-colors">Home & Garden</Link></li>
              <li><Link to="/products?category=books" className="hover:text-white transition-colors">Books</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Customer Service</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">My Account</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Order History</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>
        </div>

        {/* Payment methods */}
        <div className="mt-10 pt-6 border-t border-gray-800">
          <div className="flex flex-wrap justify-center gap-6">
            <div className="text-gray-400">
              <p className="text-sm mb-2 text-center">Accepted Payment Methods</p>
              <div className="flex space-x-4">
                <FaCreditCard size={24} />
                <FaPaypal size={24} />
                <FaApplePay size={24} />
                <FaGooglePay size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-black bg-opacity-30 py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>&copy; {currentYear} ShopEase. All rights reserved.</p>
          <div className="flex space-x-6 mt-2 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const { addToCart } = useCart();
  const { featuredProducts, loading, error, fetchFeaturedProducts } = useProducts();
  const [activeCategory, setActiveCategory] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const success = await addToCart(product._id, 1);
    if (success) {
      showToast(`${product.name} added to cart!`);
    } else {
      showToast('Failed to add item', 'error');
    }
  };

  const categories = ['all', ...new Set(featuredProducts.map(p => p.category).filter(Boolean))];
  const filteredProducts = activeCategory === 'all'
    ? featuredProducts
    : featuredProducts.filter(p => p.category === activeCategory);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl text-white font-medium flex items-center gap-3 ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}
          >
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-32 lg:py-48">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        
        <div className="container relative mx-auto px-6 text-center z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400"
          >
            Elevate Your Lifestyle.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-lg md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto font-light"
          >
            Discover a curated collection of premium products designed for the modern connoisseur.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <button
              onClick={() => navigate('/products')}
              className="bg-white text-slate-900 font-bold py-4 px-10 rounded-full hover:bg-slate-100 hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
            >
              Shop Collection
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => navigate('/register')}
                className="backdrop-blur-md bg-white/10 border border-white/20 text-white font-bold py-4 px-10 rounded-full hover:bg-white/20 transition-all"
              >
                Create Account
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="container mx-auto px-6 py-24">
        <div className="flex flex-col items-center mb-16">
          <span className="text-blue-600 font-semibold tracking-wider uppercase text-sm mb-2">Curated Selection</span>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Featured Products</h2>
          <div className="w-24 h-1 bg-blue-600 rounded-full"></div>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map(cat => (
              <button key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : error ? (
          <div className="text-center text-rose-500 py-12 bg-rose-50 rounded-2xl">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-slate-500 py-20 bg-white rounded-3xl border border-slate-100">No products found in this category.</div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredProducts.map(product => (
              <motion.div key={product._id} variants={itemVariants} layoutId={`product-${product._id}`}>
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="text-center mt-16">
          <button onClick={() => navigate('/products')}
            className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-slate-900 border border-transparent rounded-full hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
            View All Products
            <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-24 border-t border-slate-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">The ShopEase Experience</h2>
          </div>
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'On all orders above ₹500' },
              { icon: '🔒', title: 'Secure Payments', desc: 'Bank-grade 256-bit encryption' },
              { icon: '↩️', title: 'Easy Returns', desc: 'No-questions-asked 30-day policy' },
              { icon: '💬', title: '24/7 Concierge', desc: 'Premium support round the clock' }
            ].map((f, i) => (
              <motion.div key={i} variants={itemVariants} className="bg-slate-50 rounded-2xl p-8 text-center hover:bg-blue-50 transition-colors group">
                <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
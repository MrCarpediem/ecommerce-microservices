import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Search, User, Menu, X, LogOut, Settings, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const Navbar = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { getCartTotals } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          event.target.id !== 'mobile-menu-button') {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(`Searching for: ${searchQuery}`);
    setSearchQuery('');
  };

  const { itemCount } = getCartTotals();

  const isHome = location.pathname === '/';
  const navBackground = scrolled 
    ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm' 
    : isHome ? 'bg-transparent border-transparent' : 'bg-white border-b border-slate-100';
  const textColor = (isHome && !scrolled) ? 'text-white' : 'text-slate-800';
  const linkHover = (isHome && !scrolled) ? 'hover:bg-white/10' : 'hover:bg-slate-100';

  return (
    <header className={cn("fixed top-0 inset-x-0 z-50 transition-all duration-300", navBackground)}>
      <nav className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className={cn("w-10 h-10 flex items-center justify-center rounded-xl font-black text-xl transition-all duration-300", 
              (isHome && !scrolled) ? "bg-white text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.3)]" : "bg-slate-900 text-white shadow-lg"
            )}>
              S
            </div>
            <span className={cn("text-2xl font-black tracking-tight", textColor)}>
              ShopEase
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-2 ml-12">
            {['Home', 'Products', 'Orders'].map((item) => (
              <Link
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className={cn("px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200", textColor, linkHover)}
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center flex-grow justify-center max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full relative group">
              <input
                type="text"
                placeholder="Search premium products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full rounded-full py-2.5 pl-5 pr-12 text-sm outline-none transition-all duration-300 backdrop-blur-md",
                  (isHome && !scrolled) 
                    ? "bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40" 
                    : "bg-slate-100/80 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                )}
              />
              <button type="submit" className={cn("absolute right-4 top-1/2 -translate-y-1/2 transition-colors", 
                (isHome && !scrolled) ? "text-white/70 hover:text-white" : "text-slate-400 hover:text-blue-600"
              )}>
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Cart */}
            <Link to="/cart" className="relative group">
              <div className={cn("p-2.5 rounded-full transition-all duration-200 flex items-center justify-center", linkHover, textColor)}>
                <ShoppingCart size={22} />
                <AnimatePresence>
                  {isAuthenticated && itemCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm"
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={cn("flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ring-2 ring-offset-2", 
                  (isHome && !scrolled) ? "bg-white/20 ring-transparent hover:bg-white/30" : "bg-slate-100 ring-transparent hover:ring-blue-100 text-slate-700"
                )}
              >
                {isAuthenticated ? (
                  <span className="font-bold text-sm">{currentUser.username?.charAt(0).toUpperCase() || 'U'}</span>
                ) : (
                  <User size={18} className={textColor} />
                )}
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 py-2 z-50 overflow-hidden"
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                          <p className="font-bold text-slate-900 truncate">{currentUser.username}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                        </div>
                        <div className="p-2 space-y-1">
                          <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-100 transition-colors">
                            <Settings size={16} className="text-slate-400" /> Account Settings
                          </Link>
                          <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-100 transition-colors">
                            <Package size={16} className="text-slate-400" /> Order History
                          </Link>
                        </div>
                        <div className="p-2 border-t border-slate-100">
                          <button onClick={() => { logout(); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 rounded-xl hover:bg-rose-50 transition-colors">
                            <LogOut size={16} /> Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 flex flex-col gap-2">
                        <Link to="/login" className="w-full flex justify-center items-center py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors">
                          Log In
                        </Link>
                        <Link to="/register" className="w-full flex justify-center items-center py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                          Create Account
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <Link to="/cart" className={cn("relative p-2", textColor)}>
              <ShoppingCart size={22} />
              {isAuthenticated && itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
            <button 
              id="mobile-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn("p-2 rounded-lg transition-colors", linkHover, textColor)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-slate-100 overflow-hidden"
            ref={mobileMenuRef}
          >
            <div className="px-6 py-4 space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 rounded-xl py-3 pl-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={18} />
                </button>
              </form>
              
              <div className="flex flex-col space-y-1">
                {['Home', 'Products', 'Orders'].map((item) => (
                  <Link key={item} to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="py-3 text-slate-700 font-semibold border-b border-slate-50">
                    {item}
                  </Link>
                ))}
              </div>

              <div className="pt-4 flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-700">
                        {currentUser.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{currentUser.username}</p>
                        <p className="text-xs text-slate-500">{currentUser.email}</p>
                      </div>
                    </div>
                    <Link to="/profile" className="flex items-center gap-3 py-2 text-slate-700 font-medium">
                      <Settings size={18} /> Account Settings
                    </Link>
                    <button onClick={logout} className="flex items-center gap-3 py-2 text-rose-600 font-medium text-left">
                      <LogOut size={18} /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-center">Log In</Link>
                    <Link to="/register" className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-center">Create Account</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

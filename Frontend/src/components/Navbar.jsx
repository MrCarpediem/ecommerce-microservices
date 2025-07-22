import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { FaShoppingCart, FaSearch, FaUser, FaBars } from 'react-icons/fa';

const Navbar = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { getCartTotals } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
   
    console.log(`Searching for: ${searchQuery}`);
    
    setSearchQuery('');
  };

  const { itemCount } = getCartTotals();

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo and main nav */}
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold flex items-center">
                <span className="bg-white text-blue-700 rounded-lg px-2 py-1 mr-1">Shop</span>
                <span>Ease</span>
              </Link>
              
              <div className="ml-10 hidden lg:flex space-x-1">
                <Link to="/" className="hover:bg-blue-600 px-3 py-2 rounded-md transition-colors duration-200">Home</Link>
                <Link to="/products" className="hover:bg-blue-600 px-3 py-2 rounded-md transition-colors duration-200">Products</Link>
                <Link to="/orders" className="hover:bg-blue-600 px-3 py-2 rounded-md transition-colors duration-200">Orders</Link>
              </div>
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:block flex-grow max-w-md mx-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  className="w-full bg-blue-800 bg-opacity-50 text-white placeholder-blue-200 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-0 top-0 mt-2 mr-3 text-blue-200 hover:text-white">
                  <FaSearch />
                </button>
              </form>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button 
                id="mobile-menu-button"
                className="text-white hover:bg-blue-600 rounded-md p-2"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                <FaBars className="h-5 w-5" />
              </button>
            </div>

            {/* Cart and Profile section */}
            <div className="hidden lg:flex items-center">
              {/* Cart Icon with Count */}
              <Link to="/cart" className="mr-4 relative group">
                <div className="p-2 hover:bg-blue-600 rounded-full transition-colors duration-200 flex items-center">
                  <FaShoppingCart className="h-5 w-5" />
                  {isAuthenticated && itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center group-hover:animate-pulse">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center focus:outline-none hover:bg-blue-600 p-2 rounded-full transition-colors duration-200"
                  onClick={toggleDropdown}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="h-8 w-8 rounded-full bg-white text-blue-700 flex items-center justify-center">
                    {isAuthenticated ? (
                      <span className="font-bold">{currentUser.username?.charAt(0).toUpperCase() || 'U'}</span>
                    ) : (
                      <FaUser className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 z-10 animate-fade-in-down">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 text-sm text-gray-700 border-b">
                          <p className="font-medium">{currentUser.username}</p>
                          <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Account
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          My Orders
                        </Link>
                        <div className="border-t border-gray-100"></div>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                          onClick={handleLogout}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          Login
                        </Link>
                        <Link
                          to="/register"  
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu (hidden by default) */}
        {mobileMenuOpen && (
          <div className="lg:hidden" ref={mobileMenuRef}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-800 shadow-inner">
              <Link 
                to="/" 
                className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/orders" 
                className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Orders
              </Link>
              
              {/* Mobile search */}
              <div className="pt-2 pb-1">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    className="w-full bg-blue-700 text-white placeholder-blue-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute right-0 top-0 mt-2 mr-3 text-blue-300 hover:text-white">
                    <FaSearch />
                  </button>
                </form>
              </div>
              
              {/* Mobile profile links */}
              <div className="pt-4 pb-3 border-t border-blue-700">
                <Link 
                  to="/cart" 
                  className="flex items-center text-white hover:bg-blue-600 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaShoppingCart className="mr-3 h-5 w-5" />
                  Cart
                  {isAuthenticated && itemCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </Link>
                
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/profile" 
                      className="flex items-center text-white hover:bg-blue-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Account
                    </Link>
                    <button
                      className="w-full flex items-center text-white hover:bg-blue-600 px-3 py-2 rounded-md text-base font-medium text-left"
                      onClick={handleLogout}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="flex items-center text-white hover:bg-blue-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="flex items-center text-white hover:bg-blue-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const Product = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchProducts, loading, error } = useProducts();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState(null);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    loadProducts();
  }, [category, sort, page, search]);

  const loadProducts = async () => {
    const data = await fetchProducts({ category, sort, page, limit: 12, search });
    setProducts(data.products || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const success = await addToCart(product._id, 1);
    if (success) showToast(`${product.name} added to cart!`);
    else showToast('Failed to add item', 'error');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ ...Object.fromEntries(searchParams), search: searchInput, page: '1' });
  };

  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty'];
  const sortOptions = [
    { value: '', label: 'Default' },
    { value: 'price:asc', label: 'Price: Low to High' },
    { value: 'price:desc', label: 'Price: High to Low' },
    { value: 'createdAt:desc', label: 'Newest First' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-xl text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Products</h1>
          
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSearchParams({ page: '1' })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${!category ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button key={cat}
                    onClick={() => setSearchParams({ category: cat, page: '1' })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${category === cat ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <h3 className="font-semibold text-gray-900 mt-6 mb-4">Sort By</h3>
              <div className="space-y-2">
                {sortOptions.map(opt => (
                  <button key={opt.value}
                    onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), sort: opt.value, page: '1' })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${sort === opt.value ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">{total} products found</p>
            </div>

            {loading ? <Loader /> : error ? (
              <div className="text-center text-red-600 py-8">{error}</div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No products found.</p>
                <button onClick={() => setSearchParams({})} className="mt-4 text-blue-600 hover:underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p}
                        onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: p.toString() })}
                        className={`w-10 h-10 rounded-lg font-medium transition ${page === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
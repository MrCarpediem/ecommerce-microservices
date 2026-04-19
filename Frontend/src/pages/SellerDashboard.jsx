import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { formatPrice } from '../utils/formatters';
import { Package, Plus, Edit2, Trash2, Upload, X, Save, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';

const API_GATEWAY = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5006';

const emptyProduct = {
  name: '', description: '', price: '', category: '', stock: ''
};

const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Toys', 'Food'];

const SellerDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { fetchMyProducts(); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMyProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/products?limit=100');
      setProducts(res.data.products || []);
    } catch (err) {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setFormData(emptyProduct);
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock
    });
    setEditingId(product._id);
    setImagePreview(product.image ? `${API_GATEWAY}${product.image}` : null);
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      showToast('Product deleted successfully');
      fetchMyProducts();
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('stock', formData.stock);
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingId) {
        await api.put(`/api/products/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Product updated successfully');
      } else {
        await api.post('/api/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Product added successfully');
      }

      resetForm();
      fetchMyProducts();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save product';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="text-blue-600" size={28} />
                Product Management
              </h1>
              <p className="text-gray-500 mt-1">Manage your store products</p>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(!showForm); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-600/25"
            >
              {showForm ? <X size={18} /> : <Plus size={18} />}
              {showForm ? 'Cancel' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Product Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text" required minLength={2} maxLength={100}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="e.g. iPhone 15 Pro"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number" required min={0} step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="e.g. 79999"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number" required min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required minLength={10} rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Describe your product in detail..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="flex items-start gap-4">
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition overflow-hidden"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload size={24} className="mx-auto text-gray-400 mb-1" />
                        <span className="text-xs text-gray-400">Upload</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange} className="hidden"
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    <p>Supported: JPG, PNG, WebP</p>
                    <p>Max size: 5MB</p>
                    {imagePreview && (
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="text-red-500 hover:underline mt-1">Remove image</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {submitting ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}
                </button>
                <button type="button" onClick={resetForm}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No products yet</p>
            <p className="text-gray-400 mt-1">Click "Add Product" to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">All Products ({products.length})</h3>
            </div>
            <div className="divide-y">
              {products.map(product => (
                <div key={product._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.image ? (
                      <img src={`${API_GATEWAY}${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={20} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-bold text-blue-600">{formatPrice(product.price)}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{product.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(product)}
                      className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(product._id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
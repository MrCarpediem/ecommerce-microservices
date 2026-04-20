import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100/50"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
        {product.image ? (
          <motion.img 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            src={product.image?.startsWith('http') ? product.image : `${import.meta.env.VITE_API_GATEWAY_URL || ''}${product.image}`} 
            alt={product.name}
            className="w-full h-full object-cover mix-blend-multiply" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <span className="text-slate-300 text-4xl font-light">ShopEase</span>
          </div>
        )}
        
        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-wide shadow-xl">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Quick Action Overlay (Visible on Hover) */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[1px]">
          <button 
            className="bg-white text-slate-900 p-3 rounded-full shadow-xl hover:scale-110 transition-transform"
            onClick={(e) => { e.stopPropagation(); navigate(`/products/${product._id}`); }}
          >
            <ExternalLink size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0">
            {product.category}
          </span>
        </div>
        
        <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-grow">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Price</span>
            <span className="text-xl font-extrabold text-slate-900">{formatPrice(product.price)}</span>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={product.stock === 0}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 shadow-sm",
              product.stock === 0 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-slate-900 text-white hover:bg-blue-600 hover:shadow-blue-600/25 hover:shadow-lg hover:-translate-y-1"
            )}
          >
            <ShoppingCart size={20} className={product.stock > 0 ? "group-hover:animate-bounce-short" : ""} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../api/productQueries';
import { useAddToCart, useCart, useUpdateCartItem } from '../api/orderQueries';
import { toggleComparison } from '../store/slices/uiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { Sparkles, Plus, Minus, ArrowLeftRight, Star, Clock } from 'lucide-react';
import { getProductThumbnail } from '@ugbazaar/shared';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();
  const comparisonList = useSelector((state: RootState) => state.ui.comparisonList);
  const isCompared = comparisonList.includes(product._id);
  
  const { data: cartData } = useCart();
  const cartItem = cartData?.cart?.items?.find((i: any) => i.product?._id === product._id);
  
  const { mutate: addToCart, isPending: isAdding } = useAddToCart();
  const { mutate: updateCartItem, isPending: isUpdating } = useUpdateCartItem();

  const [imageError, setImageError] = useState(false);

  const thumbnail = getProductThumbnail(product.images);

  // Requirement: Hide products with missing images
  if (!thumbnail || thumbnail.trim() === '') {
    return null;
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ productId: product._id, qty: 1 });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateCartItem({ productId: product._id, qty: cartItem.qty + 1 });
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateCartItem({ productId: product._id, qty: cartItem.qty - 1 });
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleComparison(product._id));
  };

  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  // Delivery time logic (Blinkit style)
  const isQuickDelivery = ['Grocery', 'Mobiles', 'Beauty', 'General Store', 'Electrical'].includes(product.dept);
  const deliveryText = isQuickDelivery ? '10 MINS' : '30 MINS';

  return (
    <Link 
      to={`/product?id=${product._id}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-brand-border/60 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out"
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <span className="absolute top-3 right-3 bg-brand-green text-white text-[10px] font-extrabold px-2 py-1 rounded-lg z-10 shadow-sm">
          {discountPercent}% OFF
        </span>
      )}

      {/* Featured/Badge Alerts */}
      {product.badge && (
        <span className="absolute top-3 left-3 bg-brand-orange text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg z-10 flex items-center gap-1 shadow-sm">
          <Sparkles className="w-3 h-3 text-brand-yellow fill-brand-yellow" />
          <span className="uppercase tracking-wider">{product.badge}</span>
        </span>
      )}

      {/* Image Area with Quick Delivery Pill */}
      <div className="aspect-square w-full bg-[#f8f9fa] flex items-center justify-center relative p-4 overflow-hidden border-b border-brand-light">
        {!imageError ? (
          <img 
            src={thumbnail} 
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          // Requirement: Show beautiful placeholder image if image fails to load
          <div className="flex flex-col items-center justify-center text-brand-muted p-2 text-center h-full w-full">
            <svg 
              className="w-12 h-12 text-brand-muted/40 mb-2 animate-pulse" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span className="text-[10px] font-bold text-brand-muted/65 uppercase tracking-wider">Image Coming Soon</span>
          </div>
        )}

        {/* Quick Delivery Tag */}
        <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur border border-brand-border/40 text-brand-dark text-[9px] font-extrabold px-2 py-1 rounded-lg z-10 flex items-center gap-1 shadow-sm">
          <Clock className="w-3 h-3 text-[#0c831f]" />
          <span>{deliveryText}</span>
        </div>

        {/* Compare button */}
        <button 
          onClick={handleCompare}
          className={`absolute bottom-2.5 right-2.5 p-2 rounded-xl transition-all duration-200 shadow-md ${isCompared ? 'bg-brand-yellow text-brand-dark border-brand-yellow' : 'bg-white hover:bg-brand-light text-brand-muted border-brand-border/60'} border`}
          title="Compare Product"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Details Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Department & Brand */}
          <div className="flex items-center gap-1.5 justify-between">
            <span className="text-[9px] font-black tracking-wider uppercase text-brand-muted block">{product.dept}</span>
            <span className="text-[9px] font-extrabold text-brand-green/80 bg-brand-green/5 px-2 py-0.5 rounded uppercase tracking-wider">{product.brand || 'GENERIC'}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-extrabold text-sm text-brand-dark mt-1.5 group-hover:text-[#0c831f] transition-colors leading-tight line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          {(product.nameHindi || product.nameMarathi) && (
            <span className="text-xs text-brand-muted font-bold block mt-0.5">
              {product.nameHindi || product.nameMarathi}
            </span>
          )}

          {/* Ratings display - Similar to Amazon & Flipkart standards */}
          {product.ratings && product.ratings.count > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs">
              <div className="flex items-center bg-emerald-50 text-[#0c831f] font-extrabold px-1.5 py-0.5 rounded gap-0.5 border border-[#0c831f]/15">
                <span>{product.ratings.average}</span>
                <Star className="w-2.5 h-2.5 fill-[#0c831f] text-none" />
              </div>
              <span className="text-brand-muted font-bold text-[10px]">({product.ratings.count} reviews)</span>
            </div>
          )}
        </div>

        {/* Action Panel - Blinkit & Flipkart standard pricing and buttons */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-brand-light pt-3">
          <div className="flex flex-col">
            <span className="font-black text-base text-brand-dark">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-xs text-brand-muted line-through font-bold">₹{product.mrp}</span>
            )}
          </div>

          {product.stock <= 0 ? (
            <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
              Out of Stock
            </span>
          ) : cartItem ? (
            <div className="flex items-center bg-brand-green text-white rounded-xl overflow-hidden font-bold text-xs shadow-md">
              <button 
                onClick={handleDecrement}
                disabled={isUpdating}
                className="px-2.5 py-2 hover:bg-brand-green/90 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-1.5 min-w-[16px] text-center">{cartItem.qty}</span>
              <button 
                onClick={handleIncrement}
                disabled={isUpdating}
                className="px-2.5 py-2 hover:bg-brand-green/90 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAdd}
              disabled={isAdding}
              className="bg-brand-green/10 hover:bg-brand-green text-brand-green hover:text-white border border-brand-green/20 font-extrabold text-xs px-4 py-2 rounded-xl transition-all duration-150 flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm hover:shadow-md"
            >
              <Plus className="w-3 h-3" />
              <span>ADD</span>
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { getProductThumbnail } from '@ugbazaar/shared';
import { useAddToCart, useCart, useUpdateCartItem } from '../api/orderQueries';
import { ShoppingBasket, Heart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: cartData } = useCart();
  const { mutate: addToCart, isPending: isAdding } = useAddToCart();
  const { mutate: updateCartItem, isPending: isUpdating } = useUpdateCartItem();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await apiClient('/auth/wishlist');
      if (res.success && res.wishlist) {
        setWishlist(res.wishlist);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId: string) => {
    try {
      const res = await apiClient('/auth/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId })
      });
      if (res.success) {
        // Filter out from local state
        setWishlist(prev => prev.filter(item => item._id !== productId));
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  const getCartItem = (productId: string) => {
    return cartData?.cart?.items?.find((i: any) => i.product?._id === productId);
  };

  const handleAdd = (productId: string) => {
    addToCart({ productId, qty: 1 });
  };

  const handleIncrement = (productId: string, currentQty: number) => {
    updateCartItem({ productId, qty: currentQty + 1 });
  };

  const handleDecrement = (productId: string, currentQty: number) => {
    updateCartItem({ productId, qty: currentQty - 1 });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 w-1/4 rounded"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in pb-24">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-dark mb-6 uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </Link>

      <div className="flex items-center gap-3 border-b border-brand-border/60 pb-5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
          <Heart className="w-5 h-5 fill-red-500 text-none" />
        </div>
        <div>
          <h1 className="font-extrabold text-2xl text-brand-dark">My Saved Items</h1>
          <p className="text-xs text-brand-muted font-semibold mt-0.5">Your bookmarked shopping items list</p>
        </div>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wishlist.map((p) => {
            const cartItem = getCartItem(p._id);
            const discountPercent = Math.round(((p.mrp - p.price) / p.mrp) * 100);

            return (
              <div 
                key={p._id}
                className="bg-white border border-brand-border/60 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between h-[360px] relative group"
              >
                {/* Remove bookmark button */}
                <button
                  onClick={() => toggleWishlist(p._id)}
                  className="absolute top-3 right-3 p-1.5 bg-white border rounded-full text-brand-muted hover:text-red-500 hover:bg-red-50 transition-colors z-10 shadow-sm cursor-pointer"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Product display */}
                <div 
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="aspect-square bg-brand-light flex items-center justify-center p-4 rounded-xl text-5xl overflow-hidden cursor-pointer relative"
                >
                  {getProductThumbnail(p.images) ? (
                    <img src={getProductThumbnail(p.images)} alt={p.name} className="w-full h-full object-contain" />
                  ) : (
                    <span>📦</span>
                  )}
                  {discountPercent > 0 && (
                    <span className="absolute bottom-2 left-2 bg-brand-green text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                <div className="mt-3 flex-1 flex flex-col justify-between">
                  <div onClick={() => navigate(`/product/${p._id}`)} className="cursor-pointer">
                    <span className="text-[9px] text-brand-muted uppercase font-bold block">{p.dept}</span>
                    <h4 className="font-extrabold text-sm text-brand-dark mt-0.5 line-clamp-2 leading-tight min-h-[2.5rem] group-hover:text-brand-green transition-colors">
                      {p.name}
                    </h4>
                  </div>

                  {/* Actions & pricing */}
                  <div className="mt-4 flex items-center justify-between border-t border-brand-light pt-2.5">
                    <div className="flex flex-col">
                      <span className="font-black text-base text-brand-dark">₹{p.price}</span>
                      {p.mrp > p.price && (
                        <span className="text-[10px] text-brand-muted line-through font-bold">₹{p.mrp}</span>
                      )}
                    </div>

                    {p.stock <= 0 ? (
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg">
                        Out of Stock
                      </span>
                    ) : cartItem ? (
                      <div className="flex items-center bg-brand-green text-white rounded-lg overflow-hidden font-bold text-[10px] shadow-sm">
                        <button 
                          onClick={() => handleDecrement(p._id, cartItem.qty)}
                          disabled={isUpdating}
                          className="px-2 py-1.5 hover:bg-brand-green/90 transition-colors"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="px-1.5 min-w-[12px] text-center">{cartItem.qty}</span>
                        <button 
                          onClick={() => handleIncrement(p._id, cartItem.qty)}
                          disabled={isUpdating}
                          className="px-2 py-1.5 hover:bg-brand-green/90 transition-colors"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAdd(p._id)}
                        disabled={isAdding}
                        className="bg-brand-green/10 hover:bg-brand-green text-brand-green hover:text-white border border-brand-green/20 font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3 h-3" />
                        <span>ADD</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center text-brand-muted font-bold text-sm bg-white border border-brand-border/60 rounded-3xl flex flex-col items-center justify-center gap-4 max-w-xl mx-auto shadow-sm">
          <ShoppingBasket className="w-12 h-12 text-brand-muted/40" />
          <p>Your wishlist is empty!</p>
          <button 
            onClick={() => navigate('/')} 
            className="text-xs bg-brand-green text-white font-extrabold px-6 py-3 rounded-xl shadow-md cursor-pointer hover:bg-brand-green/95"
          >
            Explore Catalog
          </button>
        </div>
      )}
    </div>
  );
}

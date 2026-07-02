import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addRecentlyViewed, toggleComparison } from '../store/slices/uiSlice';
import { useProductDetails, useRecommendations } from '../api/productQueries';
import { useAddToCart, useCart, useUpdateCartItem } from '../api/orderQueries';
import { apiClient } from '../api/apiClient';
import { 
  Plus, Minus, ShoppingCart, Sparkles, MessageSquare, 
  ArrowLeftRight, HelpCircle, CheckCircle2, ChevronRight, X, Heart
} from 'lucide-react';
import { getProductThumbnail } from '@ugbazaar/shared';

export default function ProductDetail() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const id = paramId || searchParams.get('id') || '';

  const comparisonList = useSelector((state: RootState) => state.ui.comparisonList);
  const recentlyViewedIds = useSelector((state: RootState) => state.ui.recentlyViewed);
  const isCompared = comparisonList.includes(id);

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [recentlyViewedProds, setRecentlyViewedProds] = useState<any[]>([]);
  
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ transform: 'scale(1)', transformOrigin: 'center' });
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    setActiveImageIdx(0);
    setZoomStyle({ transform: 'scale(1)', transformOrigin: 'center' });
  }, [id]);

  const { data: detailData, isLoading, error } = useProductDetails(id);
  const product = detailData?.product;

  const { data: cartData } = useCart();
  const cartItem = cartData?.cart?.items?.find((i: any) => i.product?._id === id);

  const { mutate: addToCart, isPending: isAdding } = useAddToCart();
  const { mutate: updateCartItem, isPending: isUpdating } = useUpdateCartItem();

  const { data: recoData } = useRecommendations(id, 4);
  const recommendations = recoData?.recommendations || [];

  // Track recently viewed products in Redux
  useEffect(() => {
    if (id) {
      dispatch(addRecentlyViewed(id));
      fetchReviews();
      checkWishlistStatus();
    }
  }, [id, dispatch]);

  // Fetch details for recently viewed products
  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      const idsToFetch = recentlyViewedIds.filter(rvId => rvId !== id).slice(0, 4);
      if (idsToFetch.length === 0) {
        setRecentlyViewedProds([]);
        return;
      }
      try {
        const promises = idsToFetch.map(rvId => apiClient(`/products/${rvId}`).catch(() => null));
        const results = await Promise.all(promises);
        const products = results.map(r => r?.product).filter(Boolean);
        setRecentlyViewedProds(products);
      } catch (err) {
        console.error('Error fetching recently viewed products:', err);
      }
    };
    fetchRecentlyViewed();
  }, [recentlyViewedIds, id]);

  const checkWishlistStatus = async () => {
    try {
      const res = await apiClient('/auth/wishlist');
      if (res.success && res.wishlist) {
        setIsInWishlist(res.wishlist.some((item: any) => item._id === id));
      }
    } catch {}
  };

  const handleToggleWishlist = async () => {
    try {
      const res = await apiClient('/auth/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: id })
      });
      if (res.success) {
        setIsInWishlist(prev => !prev);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle wishlist');
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await apiClient(`/reviews/${id}`);
      if (res.success && res.reviews) {
        setReviews(res.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleAdd = () => {
    if (product) {
      addToCart({ productId: product._id, qty: 1 });
    }
  };

  const handleIncrement = () => {
    if (cartItem && product) {
      updateCartItem({ productId: product._id, qty: cartItem.qty + 1 });
    }
  };

  const handleDecrement = () => {
    if (cartItem && product) {
      updateCartItem({ productId: product._id, qty: cartItem.qty - 1 });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;

    setReviewLoading(true);
    setReviewSuccess(null);
    try {
      const res = await apiClient('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          productId: id,
          rating: newRating,
          title: newTitle,
          text: newText,
          tags: [product?.dept || 'General']
        })
      });
      if (res.success) {
        setReviewSuccess('Review submitted successfully! Thank you.');
        setNewTitle('');
        setNewText('');
        fetchReviews();
      }
    } catch (err: any) {
      setReviewSuccess(`Error: ${err.message || 'Submission failed'}`);
    } finally {
      setReviewLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-white rounded-3xl skeleton-pulse h-96"></div>
          <div className="space-y-6">
            <div className="h-6 bg-slate-200 w-1/4 rounded"></div>
            <div className="h-10 bg-slate-200 w-3/4 rounded"></div>
            <div className="h-4 bg-slate-200 w-1/2 rounded"></div>
            <div className="h-20 bg-slate-200 w-full rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="font-extrabold text-2xl text-brand-dark">Product Not Found</h2>
        <button onClick={() => navigate('/')} className="btn-primary mt-6">
          Back to Home
        </button>
      </div>
    );
  }

  const savings = product.mrp - product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in pb-24">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold text-brand-muted mb-6 uppercase tracking-wider">
        <Link to="/" className="hover:text-brand-green">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/search?dept=${product.dept}`} className="hover:text-brand-green">{product.dept}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-brand-dark max-w-[150px] truncate">{product.name}</span>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white border border-brand-border/60 rounded-3xl p-8 md:p-12 shadow-sm">
        
        {/* Left Side: Product Image Display */}
        <div className="flex flex-col gap-4">
          <div 
            onMouseMove={(e) => {
              const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - left) / width) * 100;
              const y = ((e.clientY - top) / height) * 100;
              setZoomStyle({
                transform: 'scale(1.8)',
                transformOrigin: `${x}% ${y}%`
              });
            }}
            onMouseLeave={() => {
              setZoomStyle({
                transform: 'scale(1)',
                transformOrigin: 'center'
              });
            }}
            onTouchStart={(e) => {
              setTouchStart(e.targetTouches[0].clientX);
            }}
            onTouchMove={(e) => {
              if (touchStart === null) return;
              const currentTouch = e.targetTouches[0].clientX;
              const diff = touchStart - currentTouch;
              const totalImgs = product.images?.length || 1;
              if (Math.abs(diff) > 50) {
                if (diff > 0) {
                  setActiveImageIdx((prev) => (prev + 1) % totalImgs);
                } else {
                  setActiveImageIdx((prev) => (prev - 1 + totalImgs) % totalImgs);
                }
                setTouchStart(null);
              }
            }}
            onTouchEnd={() => setTouchStart(null)}
            className="aspect-square bg-[#f8f9fa] rounded-2xl flex items-center justify-center p-6 border border-brand-border/60 relative overflow-hidden group cursor-zoom-in"
          >
            {product.images && product.images.length > 0 ? (
              <img 
                src={
                  typeof product.images[activeImageIdx] === 'object' && product.images[activeImageIdx] !== null
                    ? product.images[activeImageIdx].url
                    : (typeof product.images[activeImageIdx] === 'string' ? product.images[activeImageIdx] : '')
                } 
                alt={product.name} 
                style={zoomStyle}
                className="w-full h-full object-contain transition-transform duration-75 ease-out select-none"
              />
            ) : (
              <span className="text-[120px] select-none">🛍</span>
            )}
            
            {savings > 0 && (
              <span className="absolute top-4 left-4 bg-brand-green text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-md uppercase tracking-wider">
                Save ₹{savings}!
              </span>
            )}

            <button 
              onClick={handleToggleWishlist}
              className={`absolute bottom-4 right-16 p-3 rounded-xl shadow-md border ${
                isInWishlist ? 'bg-red-50 text-red-500 border-red-200 animate-pulse' : 'bg-white hover:bg-brand-light text-brand-muted border-brand-border'
              } transition-all duration-150 cursor-pointer z-10`}
              title="Toggle Wishlist"
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-none' : ''}`} />
            </button>

            <button 
              onClick={() => dispatch(toggleComparison(product._id))}
              className={`absolute bottom-4 right-4 p-3 rounded-xl shadow-md border ${
                isCompared ? 'bg-brand-yellow text-brand-dark border-brand-yellow' : 'bg-white hover:bg-brand-light text-brand-muted border-brand-border'
              } transition-all duration-150 cursor-pointer z-10`}
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* Thumbnail Gallery underneath */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-thin">
              {product.images.map((img: any, idx: number) => {
                const url = typeof img === 'object' && img !== null ? img.url : img;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-16 border-2 rounded-xl overflow-hidden flex items-center justify-center p-1 bg-white transition-all cursor-pointer ${idx === activeImageIdx ? 'border-brand-green ring-2 ring-brand-green/20' : 'border-brand-border/60 hover:border-brand-green/45'}`}
                  >
                    <img src={url} alt={`thumb-${idx}`} className="w-full h-full object-contain" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Specifications and Cart actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-black text-brand-green tracking-widest uppercase bg-brand-green/10 px-3 py-1.5 rounded-full inline-block">
              {product.dept}
            </span>
            <h1 className="font-extrabold text-2xl md:text-4xl text-brand-dark mt-4 leading-tight">
              {product.name}
            </h1>
            <p className="text-sm font-bold text-brand-muted mt-1.5 flex items-center gap-2">
              <span>{product.nameHindi || product.nameMarathi}</span>
              {product.badge && <span className="bg-brand-orange/10 text-brand-orange text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase">{product.badge}</span>}
            </p>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 mt-4">
              <div className="bg-brand-yellow text-brand-dark text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1">
                <span>★</span>
                <span>{product.ratings?.average?.toFixed(1) || '0.0'}</span>
              </div>
              <span className="text-xs font-semibold text-brand-muted">({product.ratings?.count || 0} reviews)</span>
            </div>

            {/* Price section */}
            <div className="mt-6 flex items-baseline gap-4 border-t border-brand-light pt-6">
              <span className="font-extrabold text-3xl text-brand-dark">₹{product.price}</span>
              {product.mrp > product.price && (
                <>
                  <span className="text-sm text-brand-muted line-through font-bold">₹{product.mrp}</span>
                  <span className="text-xs font-black text-brand-green">
                    ({Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF)
                  </span>
                </>
              )}
            </div>

            {/* Stock details */}
            <div className="mt-4">
              {product.stock <= 0 ? (
                <span className="inline-block bg-red-50 border border-red-200 text-red-600 font-extrabold text-xs px-3.5 py-1.5 rounded-xl">
                  Out of Stock
                </span>
              ) : product.stock < 10 ? (
                <span className="inline-block bg-orange-50 border border-orange-200 text-brand-orange font-extrabold text-xs px-3.5 py-1.5 rounded-xl">
                  Only {product.stock} left in stock!
                </span>
              ) : (
                <span className="inline-block bg-green-50 border border-green-200 text-brand-green font-extrabold text-xs px-3.5 py-1.5 rounded-xl">
                  In Stock ({product.stock} units available)
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 text-sm font-semibold text-brand-muted leading-relaxed whitespace-pre-line border-t border-brand-light pt-6">
              {product.description || 'Description has not been provided for this product yet. Rest assured, it is sourcing directly from certified local vendors.'}
            </div>
          </div>

          {/* ADD TO CART ACTION BOX */}
          <div className="bg-brand-light border border-brand-border/60 p-5 rounded-2xl flex items-center justify-between gap-4 mt-6">
            <div>
              <span className="text-xs text-brand-muted font-bold block">Final Subtotal</span>
              <span className="font-extrabold text-xl text-brand-dark">₹{(cartItem?.qty || 1) * product.price}</span>
            </div>

            {product.stock <= 0 ? (
              <button disabled className="bg-brand-muted/20 text-brand-muted cursor-not-allowed font-extrabold text-sm py-3 px-8 rounded-xl">
                Unavailable
              </button>
            ) : cartItem ? (
              <div className="flex items-center bg-brand-green text-white rounded-xl overflow-hidden font-extrabold text-sm shadow-md h-12">
                <button 
                  onClick={handleDecrement}
                  disabled={isUpdating}
                  className="px-4 hover:bg-brand-green/90 h-full flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 min-w-[24px] text-center">{cartItem.qty}</span>
                <button 
                  onClick={handleIncrement}
                  disabled={isUpdating}
                  className="px-4 hover:bg-brand-green/90 h-full flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleAdd}
                disabled={isAdding}
                className="btn-primary py-3 px-8 text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>ADD TO BASKET</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Frequently Bought Together */}
      {product && recommendations.length > 0 && (
        <section className="mt-12 bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="font-extrabold text-lg text-brand-dark mb-4">Frequently Bought Together</h3>
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Current item */}
              <div className="flex items-center gap-3 bg-brand-light p-3 rounded-2xl border">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 border">
                  {getProductThumbnail(product.images) ? (
                    <img src={getProductThumbnail(product.images)} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-dark block max-w-[150px] truncate">{product.name}</span>
                  <span className="font-extrabold text-sm text-brand-green">₹{product.price}</span>
                </div>
              </div>

              <span className="text-xl font-bold text-brand-muted">+</span>

              {/* Partner item */}
              <div className="flex items-center gap-3 bg-brand-light p-3 rounded-2xl border">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 border animate-pulse">
                  {getProductThumbnail(recommendations[0].images) ? (
                    <img src={getProductThumbnail(recommendations[0].images)} alt={recommendations[0].name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-dark block max-w-[150px] truncate">{recommendations[0].name}</span>
                  <span className="font-extrabold text-sm text-brand-green">₹{recommendations[0].price}</span>
                </div>
              </div>
            </div>

            {/* Price & Action */}
            <div className="flex flex-col sm:flex-row items-center gap-5 border-t md:border-t-0 border-brand-light pt-4 md:pt-0 w-full md:w-auto justify-end">
              <div>
                <span className="text-xs text-brand-muted font-bold block">Combo Price</span>
                <span className="font-black text-2xl text-brand-dark">₹{product.price + recommendations[0].price}</span>
              </div>
              <button
                onClick={async () => {
                  try {
                    addToCart({ productId: product._id, qty: 1 });
                    addToCart({ productId: recommendations[0]._id, qty: 1 });
                    alert('Both items added to your basket!');
                  } catch (err: any) {
                    alert(err.message || 'Failed to add combo');
                  }
                }}
                className="bg-brand-yellow hover:bg-brand-yellow/90 text-brand-dark font-extrabold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer w-full sm:w-auto text-center"
              >
                Add Both to Basket
              </button>
            </div>
          </div>
        </section>
      )}



      {/* Related Products */}
      {recommendations.length > 0 && (
        <section className="mt-16">
          <h2 className="font-extrabold text-xl text-brand-dark border-b border-brand-border/60 pb-3 mb-6 font-sans">
            Related Products
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map((p) => (
              <div 
                key={p._id} 
                onClick={() => navigate(`/product/${p._id}`)}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between h-72"
              >
                <div className="aspect-square bg-brand-light flex items-center justify-center p-4 rounded-xl text-4xl overflow-hidden">
                  {getProductThumbnail(p.images) ? (
                    <img 
                      src={getProductThumbnail(p.images)} 
                      alt={p.name} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div className="mt-3">
                  <span className="text-[10px] text-brand-muted uppercase font-bold block">{p.dept}</span>
                  <h4 className="font-extrabold text-sm text-brand-dark mt-0.5 truncate">{p.name}</h4>
                  <span className="font-black text-brand-green text-sm block mt-2">₹{p.price}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewedProds.length > 0 && (
        <section className="mt-16">
          <h2 className="font-extrabold text-xl text-brand-dark border-b border-brand-border/60 pb-3 mb-6 font-sans">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recentlyViewedProds.map((p) => (
              <div 
                key={p._id} 
                onClick={() => navigate(`/product/${p._id}`)}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between h-72"
              >
                <div className="aspect-square bg-brand-light flex items-center justify-center p-4 rounded-xl text-4xl overflow-hidden">
                  {getProductThumbnail(p.images) ? (
                    <img 
                      src={getProductThumbnail(p.images)} 
                      alt={p.name} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div className="mt-3">
                  <span className="text-[10px] text-brand-muted uppercase font-bold block">{p.dept}</span>
                  <h4 className="font-extrabold text-sm text-brand-dark mt-0.5 truncate">{p.name}</h4>
                  <span className="font-black text-brand-green text-sm block mt-2">₹{p.price}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Review Submission & Reviews Lists */}
      <section className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Reviews List */}
        <div className="space-y-6">
          <h2 className="font-extrabold text-xl text-brand-dark flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-green" />
            <span>Customer Reviews ({reviews.length})</span>
          </h2>
          
          {reviews.length > 0 ? (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {reviews.map((r, idx) => (
                <div key={idx} className="bg-white border border-brand-border/60 p-5 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-sm text-brand-dark">{r.user?.name || 'Anonymous User'}</p>
                      <p className="text-[10px] text-brand-muted font-semibold mt-0.5">{r.user?.village || 'Talodhi'}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-brand-yellow font-bold text-xs">★ {r.rating}</span>
                      {r.verified && (
                        <span className="text-[10px] text-brand-green font-bold bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 fill-brand-green text-white" />
                          <span>Verified Purchase</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="font-extrabold text-sm text-brand-dark pt-1">{r.title}</p>
                  <p className="text-xs text-brand-muted font-medium leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border rounded-2xl p-8 text-center text-brand-muted font-bold text-sm">
              No reviews available yet. Be the first to review!
            </div>
          )}
        </div>

        {/* Submit Review Form */}
        <div className="bg-white border border-brand-border/60 p-6 md:p-8 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-lg text-brand-dark border-b border-brand-light pb-3 mb-6">
            Write a Review
          </h3>
          
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider block mb-2">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className={`text-2xl transition-transform ${star <= newRating ? 'text-brand-yellow' : 'text-slate-200'} hover:scale-115`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider block mb-2">Review Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Summary of your review (e.g. Great quality Rice!)"
                className="w-full bg-brand-light border border-brand-border/60 focus:border-brand-green focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none font-medium transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider block mb-2">Review Text</label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Share details of your experience using this product..."
                className="w-full bg-brand-light border border-brand-border/60 focus:border-brand-green focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none font-medium transition-all h-28 resize-none"
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={reviewLoading}
              className="btn-primary w-full text-sm font-extrabold py-3"
            >
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>

            {reviewSuccess && (
              <p className="text-xs font-bold text-center mt-2 text-brand-green">
                {reviewSuccess}
              </p>
            )}
          </form>
        </div>

      </section>

    </div>
  );
}

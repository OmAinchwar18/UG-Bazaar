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
  ArrowLeftRight, HelpCircle, CheckCircle2, ChevronRight, X, Heart, Volume2
} from 'lucide-react';
import { getProductThumbnail, getTranslated } from '@ugbazaar/shared';
import { useTranslation } from '../hooks/useTranslation';


export default function ProductDetail() {
  const { currentDict, lang } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const id = paramId || searchParams.get('id') || '';

  const comparisonList = useSelector((state: RootState) => state.ui.comparisonList);
  const recentlyViewedIds = useSelector((state: RootState) => state.ui.recentlyViewed);
  const isCompared = comparisonList.includes(id);

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !product) return;
    window.speechSynthesis.cancel();
    
    const prodName = getTranslated(product.name, lang);
    const prodDesc = getTranslated(product.description, lang);
    const textToSpeak = `${prodName}. ${prodDesc ? prodDesc : ''}`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const langMap = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };
    utterance.lang = langMap[lang] || 'en-IN';

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(utterance.lang) || v.lang.replace('_', '-').startsWith(utterance.lang));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

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
        <span className="text-brand-dark max-w-[150px] truncate">{getTranslated(product.name, lang)}</span>
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
                alt={getTranslated(product.name, lang)} 
                style={zoomStyle}
                className="w-full h-full object-contain transition-transform duration-75 ease-out select-none"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-brand-muted p-6 text-center h-full w-full">
                <svg 
                  className="w-16 h-16 text-brand-muted/40 mb-3 animate-pulse" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className="text-xs font-bold text-brand-muted/65 uppercase tracking-wider">Image Coming Soon</span>
              </div>
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
              {getTranslated(product.category, lang) || product.dept}
            </span>
            <h1 className="font-extrabold text-2xl md:text-4xl text-brand-dark mt-4 leading-tight">
              {getTranslated(product.name, lang)}
            </h1>
            <div className="flex items-center gap-2.5 mt-2">
              {product.badge && <span className="bg-brand-orange/10 text-brand-orange text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase">{product.badge}</span>}
              <button 
                onClick={handleSpeak}
                className="bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white transition-all text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                title="Speak Product Details"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'विवरण सुनें' : lang === 'mr' ? 'तपशील ऐका' : 'Listen'}</span>
              </button>
            </div>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 mt-4">
              <div className="bg-brand-yellow text-brand-dark text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1">
                <span>★</span>
                <span>{product.ratings?.average?.toFixed(1) || '0.0'}</span>
              </div>
              <span className="text-xs font-semibold text-brand-muted">({product.ratings?.count || 0} {currentDict.product.reviewsTitle.toLowerCase()})</span>
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
                  {currentDict.product.outOfStock}
                </span>
              ) : product.stock < 10 ? (
                <span className="inline-block bg-orange-50 border border-orange-200 text-brand-orange font-extrabold text-xs px-3.5 py-1.5 rounded-xl">
                  {lang === 'hi' ? `केवल ${product.stock} स्टॉक में बचे हैं!` : lang === 'mr' ? `फक्त ${product.stock} स्टॉकमध्ये शिल्लक आहेत!` : `Only ${product.stock} left in stock!`}
                </span>
              ) : (
                <span className="inline-block bg-green-50 border border-green-200 text-brand-green font-extrabold text-xs px-3.5 py-1.5 rounded-xl">
                  {currentDict.product.inStock} ({product.stock} {lang === 'hi' ? 'नग' : lang === 'mr' ? 'नग' : 'units'})
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 text-sm font-semibold text-brand-muted leading-relaxed whitespace-pre-line border-t border-brand-light pt-6">
              <h3 className="font-extrabold text-sm text-brand-dark uppercase tracking-wider mb-2">{currentDict.product.descriptionTitle}</h3>
              {getTranslated(product.description, lang) || 'Description has not been provided for this product yet.'}
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="mt-6 border-t border-brand-light pt-6">
                <h3 className="font-extrabold text-sm text-brand-dark uppercase tracking-wider mb-3">
                  {currentDict.product.specsTitle}
                </h3>
                <div className="grid grid-cols-2 gap-y-2 text-xs font-semibold">
                  {product.specifications.map((spec: any, idx: number) => (
                    <React.Fragment key={idx}>
                      <div className="text-brand-muted bg-brand-light p-2.5 rounded-l-xl">
                        {getTranslated(spec.key, lang)}
                      </div>
                      <div className="text-brand-dark bg-brand-light/50 p-2.5 rounded-r-xl">
                        {getTranslated(spec.value, lang)}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mt-6 border-t border-brand-light pt-6">
                <h3 className="font-extrabold text-sm text-brand-dark uppercase tracking-wider mb-3">
                  {currentDict.product.featuresTitle}
                </h3>
                <ul className="list-disc list-inside text-xs font-semibold text-brand-muted space-y-1.5">
                  {product.features.map((feat: any, idx: number) => (
                    <li key={idx} className="leading-relaxed">
                      {getTranslated(feat, lang)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ADD TO CART ACTION BOX */}
          <div className="bg-brand-light border border-brand-border/60 p-5 rounded-2xl flex items-center justify-between gap-4 mt-6">
            <div>
              <span className="text-xs text-brand-muted font-bold block">{currentDict.cart.subtotal}</span>
              <span className="font-extrabold text-xl text-brand-dark">₹{(cartItem?.qty || 1) * product.price}</span>
            </div>

            {product.stock <= 0 ? (
              <button disabled className="bg-brand-muted/20 text-brand-muted cursor-not-allowed font-extrabold text-sm py-3 px-8 rounded-xl">
                {lang === 'hi' ? 'अनुपलब्ध' : lang === 'mr' ? 'अनुपलब्ध' : 'Unavailable'}
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
                <span>{currentDict.buttons.addToCart.toUpperCase()}</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Frequently Bought Together */}
      {product && recommendations.length > 0 && (
        <section className="mt-12 bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="font-extrabold text-lg text-brand-dark mb-4">
            {lang === 'hi' ? 'अक्सर एक साथ खरीदे जाने वाले' : lang === 'mr' ? 'वारंवार एकत्र खरेदी केलेले' : 'Frequently Bought Together'}
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Current item */}
              <div className="flex items-center gap-3 bg-brand-light p-3 rounded-2xl border">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 border">
                  {getProductThumbnail(product.images) ? (
                    <img src={getProductThumbnail(product.images)} alt={getTranslated(product.name, lang)} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-dark block max-w-[150px] truncate">{getTranslated(product.name, lang)}</span>
                  <span className="font-extrabold text-sm text-brand-green">₹{product.price}</span>
                </div>
              </div>

              <span className="text-xl font-bold text-brand-muted">+</span>

              {/* Partner item */}
              <div className="flex items-center gap-3 bg-brand-light p-3 rounded-2xl border">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 border animate-pulse">
                  {getProductThumbnail(recommendations[0].images) ? (
                    <img src={getProductThumbnail(recommendations[0].images)} alt={getTranslated(recommendations[0].name, lang)} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-dark block max-w-[150px] truncate">{getTranslated(recommendations[0].name, lang)}</span>
                  <span className="font-extrabold text-sm text-brand-green">₹{recommendations[0].price}</span>
                </div>
              </div>
            </div>

            {/* Price & Action */}
            <div className="flex flex-col sm:flex-row items-center gap-5 border-t md:border-t-0 border-brand-light pt-4 md:pt-0 w-full md:w-auto justify-end">
              <div>
                <span className="text-xs text-brand-muted font-bold block">
                  {lang === 'hi' ? 'कॉम्बो कीमत' : lang === 'mr' ? 'कॉम्बो किंमत' : 'Combo Price'}
                </span>
                <span className="font-black text-2xl text-brand-dark">₹{product.price + recommendations[0].price}</span>
              </div>
              <button
                onClick={async () => {
                  try {
                    addToCart({ productId: product._id, qty: 1 });
                    addToCart({ productId: recommendations[0]._id, qty: 1 });
                    alert(lang === 'hi' ? 'दोनों सामान आपके बास्केट में जोड़ दिए गए हैं!' : lang === 'mr' ? 'दोन्ही वस्तू तुमच्या बास्केटमध्ये जोडल्या गेल्या आहेत!' : 'Both items added to your basket!');
                  } catch (err: any) {
                    alert(err.message || 'Failed to add combo');
                  }
                }}
                className="bg-brand-yellow hover:bg-brand-yellow/90 text-brand-dark font-extrabold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer w-full sm:w-auto text-center"
              >
                {lang === 'hi' ? 'दोनों को बास्केट में जोड़ें' : lang === 'mr' ? 'दोन्ही बास्केटमध्ये जोडा' : 'Add Both to Basket'}
              </button>
            </div>
          </div>
        </section>
      )}



      {/* Related Products */}
      {recommendations.length > 0 && (
        <section className="mt-16">
          <h2 className="font-extrabold text-xl text-brand-dark border-b border-brand-border/60 pb-3 mb-6 font-sans">
            {currentDict.product.relatedTitle}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map((p) => (
              <div 
                key={p._id} 
                onClick={() => navigate(`/product?id=${p._id}`)}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between h-72"
              >
                <div className="aspect-square bg-brand-light flex items-center justify-center p-4 rounded-xl text-4xl overflow-hidden">
                  {getProductThumbnail(p.images) ? (
                    <img 
                      src={getProductThumbnail(p.images)} 
                      alt={getTranslated(p.name, lang)} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div className="mt-3">
                  <span className="text-[10px] text-brand-muted uppercase font-bold block">
                    {getTranslated(p.category, lang) || p.dept}
                  </span>
                  <h4 className="font-extrabold text-sm text-brand-dark mt-0.5 truncate">{getTranslated(p.name, lang)}</h4>
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
            {lang === 'hi' ? 'हाल ही में देखे गए' : lang === 'mr' ? 'नुकतीच पाहिलेली उत्पादने' : 'Recently Viewed'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recentlyViewedProds.map((p) => (
              <div 
                key={p._id} 
                onClick={() => navigate(`/product?id=${p._id}`)}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between h-72"
              >
                <div className="aspect-square bg-brand-light flex items-center justify-center p-4 rounded-xl text-4xl overflow-hidden">
                  {getProductThumbnail(p.images) ? (
                    <img 
                      src={getProductThumbnail(p.images)} 
                      alt={getTranslated(p.name, lang)} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div className="mt-3">
                  <span className="text-[10px] text-brand-muted uppercase font-bold block">
                    {getTranslated(p.category, lang) || p.dept}
                  </span>
                  <h4 className="font-extrabold text-sm text-brand-dark mt-0.5 truncate">{getTranslated(p.name, lang)}</h4>
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
            <span>{currentDict.product.reviewsTitle} ({reviews.length})</span>
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
                          <span>{lang === 'hi' ? 'सत्यापित खरीद' : lang === 'mr' ? 'सत्यापित खरेदी' : 'Verified Purchase'}</span>
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
              {lang === 'hi' ? 'अभी तक कोई समीक्षा उपलब्ध नहीं है। समीक्षा लिखने वाले पहले व्यक्ति बनें!' : lang === 'mr' ? 'अद्याप कोणतीही पुनरावलोकने उपलब्ध नाहीत. पुनरावलोकन करणारे पहिले व्हा!' : 'No reviews available yet. Be the first to review!'}
            </div>
          )}
        </div>

        {/* Submit Review Form */}
        <div className="bg-white border border-brand-border/60 p-6 md:p-8 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-lg text-brand-dark border-b border-brand-light pb-3 mb-6">
            {currentDict.product.addReviewTitle}
          </h3>
          
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider block mb-2">{currentDict.product.rateLabel}</label>
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
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider block mb-2">
                {lang === 'hi' ? 'समीक्षा का शीर्षक' : lang === 'mr' ? 'पुनरावलोकन शीर्षक' : 'Review Title'}
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={lang === 'hi' ? 'समीक्षा का सारांश' : lang === 'mr' ? 'पुनरावलोकनाचा सारांश' : 'Summary of your review'}
                className="w-full bg-brand-light border border-brand-border/60 focus:border-brand-green focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none font-medium transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider block mb-2">{currentDict.product.commentLabel}</label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder={currentDict.product.reviewPlaceholder}
                className="w-full bg-brand-light border border-brand-border/60 focus:border-brand-green focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none font-medium transition-all h-28 resize-none"
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={reviewLoading}
              className="btn-primary w-full text-sm font-extrabold py-3"
            >
              {reviewLoading ? (lang === 'hi' ? 'जमा किया जा रहा है...' : lang === 'mr' ? 'सबमिट करत आहे...' : 'Submitting...') : currentDict.buttons.submitReview}
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

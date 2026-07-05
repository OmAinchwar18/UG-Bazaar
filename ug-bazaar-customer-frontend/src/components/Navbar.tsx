import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { setLanguage } from '../store/slices/uiSlice';
import { useCart } from '../api/orderQueries';
import { apiClient } from '../api/apiClient';
import { getProductThumbnail, dict, getTranslated } from '@ugbazaar/shared';
import { 
  MapPin, Search, ShoppingCart, User, Globe, 
  Sparkles, Bell, Percent, LogOut, ChevronDown, Menu
} from 'lucide-react';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const lang = useSelector((state: RootState) => state.ui.lang);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  const currentDict = dict[lang] || dict.en;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);

  const { data: cartData } = useCart();
  const cartItemsCount = cartData?.cart?.items?.reduce((sum: number, item: any) => sum + item.qty, 0) || 0;
  const cartTotalAmount = cartData?.cart?.items?.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0) || 0;

  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Autocomplete fetch on search changes
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await apiClient(`/products/search?q=${searchQuery}`);
        if (res.success && res.products) {
          setSuggestions(res.products.slice(0, 5));
        }
      } catch (err) {
        console.error('Search suggestion error:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside listener for suggestions list
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (prodId: string) => {
    setShowSuggestions(false);
    navigate(`/product?id=${prodId}`);
  };

  const triggerAISuggestions = async () => {
    if (!searchQuery.trim()) return;
    setAiLoading(true);
    setAiTip(null);
    try {
      const res = await apiClient('/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: `Recommend 3 products matching or related to "${searchQuery}" in short bullet points. Mention prices.`
        })
      });
      if (res.success && res.reply) {
        setAiTip(res.reply);
      }
    } catch {
      setAiTip("Try searching for organic fertilizers or basmati rice!");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-border/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Hyperlocal Location */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="bg-brand-green text-white p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-6 h-6 text-brand-yellow fill-brand-yellow" />
              </span>
              <div className="leading-tight">
                <span className="font-extrabold text-2xl text-brand-dark tracking-tight">UG</span>
                <span className="font-bold text-brand-green text-lg block -mt-1 tracking-wide">Bazaar</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2 border-l border-brand-border/80 pl-6 py-1">
              <MapPin className="w-5 h-5 text-brand-green" />
              <div className="text-left leading-tight">
                <span className="font-bold text-sm block text-brand-dark">{currentDict.navbar.location}</span>
                <span className="text-xs text-brand-muted font-medium">Opp. CDCC Bank</span>
              </div>
            </div>
          </div>

          {/* Autocomplete Smart Search Bar */}
          <div className="flex-1 max-w-xl relative" ref={suggestionsRef}>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={currentDict.navbar.searchPlaceholder}
                className="w-full pl-11 pr-24 py-3 bg-brand-light border border-brand-border/80 focus:border-brand-green focus:bg-white rounded-2xl outline-none font-medium text-sm transition-all duration-200"
              />
              <Search className="w-5 h-5 text-brand-muted absolute left-4" />
              
              <button 
                type="button"
                onClick={triggerAISuggestions}
                className="absolute right-3 bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white transition-colors duration-200 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
            </form>

            {/* Suggestions Overlay */}
            {showSuggestions && (searchQuery.trim().length >= 2 || aiTip || aiLoading) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-brand-border shadow-2xl rounded-2xl overflow-hidden z-50 animate-fade-in">
                
                {/* Instant DB Matches */}
                {suggestions.length > 0 && (
                  <div className="p-2 border-b border-brand-border/40">
                    <p className="text-xs font-bold text-brand-muted px-3 py-1">PRODUCT MATCHES</p>
                    {suggestions.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => handleSuggestionClick(p._id)}
                        className="flex items-center justify-between p-3 hover:bg-brand-light rounded-xl cursor-pointer transition-colors duration-150"
                      >
                        <div className="flex items-center gap-3">
                          {getProductThumbnail(p.images) ? (
                            <img src={getProductThumbnail(p.images)} alt={getTranslated(p.name, lang)} className="w-8 h-8 object-contain rounded-lg border bg-brand-light" />
                          ) : (
                            <span className="text-xl bg-brand-light p-1.5 rounded-lg">📦</span>
                          )}
                          <span className="font-semibold text-brand-dark text-sm">{getTranslated(p.name, lang)}</span>
                        </div>
                        <span className="font-bold text-brand-green text-sm">₹{p.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Suggestions Drawer */}
                <div className="p-4 bg-brand-light/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-brand-green" />
                    <span className="text-xs font-bold text-brand-green tracking-wider">AI ASSISTANT TIPS</span>
                  </div>
                  {aiLoading ? (
                    <div className="flex items-center gap-2 text-sm text-brand-muted">
                      <div className="w-4 h-4 border-2 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                      <span>Thinking...</span>
                    </div>
                  ) : aiTip ? (
                    <div className="text-xs text-brand-dark leading-relaxed whitespace-pre-line font-medium bg-white p-3 rounded-xl border border-brand-border/60">
                      {aiTip}
                    </div>
                  ) : (
                    <p className="text-xs text-brand-muted font-medium">Click "Ask AI" to get personalized suggestions for "{searchQuery}"!</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links, Dropdowns, and Cart button */}
          <div className="flex items-center gap-4 flex-shrink-0">
            
            {/* Language Selection */}
            <div className="relative">
              <button 
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 text-sm font-bold text-brand-dark bg-brand-light px-3 py-2 rounded-xl border border-brand-border/60 hover:bg-brand-border/20 transition-all duration-150"
              >
                <Globe className="w-4 h-4 text-brand-muted" />
                <span className="uppercase">{lang}</span>
                <ChevronDown className="w-4 h-4 text-brand-muted" />
              </button>
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-brand-border shadow-xl rounded-xl overflow-hidden w-36 z-50 animate-slide-up">
                  <button 
                    onClick={() => { dispatch(setLanguage('en')); setIsLangDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-brand-light font-semibold text-sm"
                  >
                    English
                  </button>
                  <button 
                    onClick={() => { dispatch(setLanguage('hi')); setIsLangDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-brand-light font-semibold text-sm"
                  >
                    हिन्दी (Hindi)
                  </button>
                  <button 
                    onClick={() => { dispatch(setLanguage('mr')); setIsLangDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-brand-light font-semibold text-sm"
                  >
                    मराठी (Marathi)
                  </button>
                </div>
              )}
            </div>

            {/* Offers Page */}
            <Link to="/offers" className="hidden lg:flex items-center gap-1.5 text-sm font-bold text-brand-muted hover:text-brand-green transition-all">
              <Percent className="w-4 h-4" />
              <span>{currentDict.navbar.offers}</span>
            </Link>

            {/* Notifications */}
            {isAuthenticated && (
              <Link to="/notifications" className="p-2.5 rounded-xl bg-brand-light border border-brand-border/60 hover:bg-brand-border/20 text-brand-dark transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-orange rounded-full"></span>
              </Link>
            )}

            {/* Profile / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 bg-brand-light px-3.5 py-2.5 rounded-xl border border-brand-border/60 hover:bg-brand-border/20 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-green/10 flex items-center justify-center font-bold text-brand-green text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-bold text-sm text-brand-dark max-w-[80px] truncate">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-brand-muted" />
                </button>
                
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white border border-brand-border shadow-2xl rounded-2xl overflow-hidden w-56 z-50 animate-slide-up">
                    <div className="p-4 border-b border-brand-border/40 bg-brand-light/35">
                      <p className="font-extrabold text-brand-dark text-sm leading-tight">{user?.name}</p>
                      <p className="text-xs text-brand-muted font-semibold mt-0.5">{user?.mobile}</p>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-brand-light font-bold text-brand-dark text-sm transition-colors"
                    >
                      <User className="w-4 h-4 text-brand-muted" />
                      <span>{currentDict.navbar.profile}</span>
                    </Link>
                    <button
                      onClick={() => {
                        dispatch(logout());
                        setIsUserDropdownOpen(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 text-red-600 font-bold text-sm transition-colors border-t border-brand-border/40"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{currentDict.navbar.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="btn-secondary py-2 px-4 text-sm">
                <User className="w-4 h-4" />
                <span>{currentDict.navbar.login}</span>
              </Link>
            )}

            {/* Cart Button Drawer */}
            <Link 
              to="/cart" 
              className="flex items-center gap-3.5 bg-brand-green text-white px-4 py-2.5 rounded-2xl hover:bg-opacity-95 active:scale-95 transition-all shadow-md shadow-brand-green/20"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 ? (
                  <div className="leading-tight text-left">
                    <span className="font-bold text-xs block">{cartItemsCount} Items</span>
                    <span className="font-extrabold text-sm">₹{cartTotalAmount}</span>
                  </div>
                ) : (
                  <span className="font-bold text-sm">{currentDict.navbar.cart}</span>
                )}
              </div>
            </Link>

          </div>

        </div>
      </div>
    </header>
  );
}

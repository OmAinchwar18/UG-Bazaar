import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { clearComparison, toggleComparison } from '../store/slices/uiSlice';
import { apiClient } from '../api/apiClient';
import { useAddToCart, useCart, useUpdateCartItem } from '../api/orderQueries';
import { ArrowLeftRight, Trash2, ArrowLeft, Star, Plus, Minus, ShoppingBag, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getProductThumbnail, getTranslated } from '@ugbazaar/shared';
import { useTranslation } from '../hooks/useTranslation';
import './Compare.css';

export default function Compare() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const comparisonList = useSelector((state: RootState) => state.ui.comparisonList);
  const { currentDict, lang } = useTranslation();
  
  const [comparedProducts, setComparedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Cart operations
  const { data: cartData } = useCart();
  const { mutate: addToCart, isPending: isAdding } = useAddToCart();
  const { mutate: updateCartItem, isPending: isUpdating } = useUpdateCartItem();

  useEffect(() => {
    if (comparisonList.length > 0) {
      fetchComparedProducts();
    } else {
      setComparedProducts([]);
    }
  }, [comparisonList]);

  const fetchComparedProducts = async () => {
    setLoading(true);
    try {
      const promises = comparisonList.map(id => apiClient(`/products/${id}`));
      const results = await Promise.all(promises);
      const prods = results.map(r => r.product).filter(Boolean);
      setComparedProducts(prods);
    } catch (err) {
      console.error('Error fetching compared products:', err);
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in pb-24">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-dark mb-6 uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === 'hi' ? 'मुख्यपृष्ठ पर वापस जाएं' : lang === 'mr' ? 'मुख्यपृष्ठावर परत जा' : 'Back to Home'}</span>
      </Link>

      {/* PRODUCT COMPARISON MODULE */}
      <section className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-light pb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-brand-dark">
                {lang === 'hi' ? 'उत्पाद तुलना डैशबोर्ड' : lang === 'mr' ? 'उत्पादन तुलना डॅशबोर्ड' : 'Product Comparison Dashboard'}
              </h1>
              <p className="text-xs text-brand-muted font-semibold mt-0.5">
                {lang === 'hi' ? 'विशेषताओं और फीचर्स की साथ-साथ तुलना करें' : lang === 'mr' ? 'तपशील आणि वैशिष्ट्यांची शेजारी-शेजारी तुलना करा' : 'Compare specifications and features side-by-side'}
              </p>
            </div>
          </div>
          
          {comparisonList.length > 0 && (
            <button
              onClick={() => dispatch(clearComparison())}
              className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'सभी उत्पाद साफ़ करें' : lang === 'mr' ? 'सर्व उत्पादने साफ करा' : 'Clear All Products'}</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-slate-50 border border-brand-border/40 skeleton-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : comparedProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse table-fixed">
              <thead>
                <tr className="border-b border-brand-border bg-brand-light/30">
                  <th className="py-4 px-4 w-52 font-black text-brand-muted uppercase text-[10px] tracking-wider text-left align-top">
                    {lang === 'hi' ? 'उत्पाद विवरण' : lang === 'mr' ? 'उत्पादन तपशील' : 'Product Details'}
                  </th>
                  {comparedProducts.map((p) => (
                    <th key={p._id} className="py-4 px-4 text-center align-top relative">
                      <button
                        onClick={() => dispatch(toggleComparison(p._id))}
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div 
                        onClick={() => navigate(`/product?id=${p._id}`)}
                        className="flex flex-col items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-24 h-24 bg-brand-light rounded-2xl flex items-center justify-center p-3 border border-brand-border/40 transition-transform duration-200 group-hover:scale-105">
                          {getProductThumbnail(p.images) ? (
                            <img src={getProductThumbnail(p.images)} alt={getTranslated(p.name, lang)} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-4xl">📦</span>
                          )}
                        </div>
                        <div>
                          <span className="text-[9px] font-black tracking-wider uppercase text-brand-muted block">
                            {getTranslated(p.category, lang) || p.dept}
                          </span>
                          <span className="font-extrabold text-brand-dark text-sm block leading-tight mt-1 group-hover:text-brand-green transition-colors">{getTranslated(p.name, lang)}</span>
                        </div>
                      </div>
                    </th>
                  ))}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, idx) => (
                    <th key={`empty-th-${idx}`} className="py-4 px-4 text-center align-middle text-brand-muted/40 font-semibold border-l border-brand-light/40">
                      <div className="flex flex-col items-center justify-center h-32 border border-dashed border-brand-border rounded-2xl p-4">
                        <span className="text-2xl font-bold">+</span>
                        <span className="text-[10px] font-extrabold uppercase mt-1">
                          {lang === 'hi' ? 'उत्पाद जोड़ें' : lang === 'mr' ? 'उत्पादन जोडा' : 'Add Product'}
                        </span>
                        <button 
                          onClick={() => navigate('/')} 
                          className="mt-3 text-[10px] bg-brand-green/10 text-brand-green border border-brand-green/20 px-2.5 py-1 rounded-lg font-bold hover:bg-brand-green hover:text-white transition-all cursor-pointer"
                        >
                          {currentDict.buttons.browseCatalog}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-light text-sm">
                
                {/* Brand */}
                <tr className="hover:bg-brand-light/10">
                  <td className="py-4 px-4 font-black text-brand-muted uppercase text-[10px] tracking-wider align-middle">
                    {lang === 'hi' ? 'ब्रांड' : lang === 'mr' ? 'ब्रँड' : 'Brand'}
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p._id} className="py-4 px-4 text-center text-brand-dark font-extrabold">
                      {p.brand || 'GENERIC'}
                    </td>
                  ))}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <td key={`empty-brand-${i}`} className="py-4 px-4 text-center text-brand-muted/20">-</td>
                  ))}
                </tr>

                {/* Price */}
                <tr className="hover:bg-brand-light/10">
                  <td className="py-4 px-4 font-black text-brand-muted uppercase text-[10px] tracking-wider align-middle">
                    {lang === 'hi' ? 'बिक्री मूल्य' : lang === 'mr' ? 'विक्री किंमत' : 'Selling Price'}
                  </td>
                  {comparedProducts.map((p) => {
                    const discountPercent = Math.round(((p.mrp - p.price) / p.mrp) * 100);
                    return (
                      <td key={p._id} className="py-4 px-4 text-center font-black text-brand-green text-base">
                        ₹{p.price}
                        {p.mrp > p.price && (
                          <div className="block text-xs font-bold text-brand-muted mt-0.5">
                            <span className="line-through mr-1">₹{p.mrp}</span>
                            <span className="text-brand-green text-[10px] font-black">({discountPercent}% OFF)</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <td key={`empty-price-${i}`} className="py-4 px-4 text-center text-brand-muted/20">-</td>
                  ))}
                </tr>

                {/* Ratings */}
                <tr className="hover:bg-brand-light/10">
                  <td className="py-4 px-4 font-black text-brand-muted uppercase text-[10px] tracking-wider align-middle">
                    {lang === 'hi' ? 'रेटिंग' : lang === 'mr' ? 'रेटिंग' : 'Ratings'}
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p._id} className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center gap-1 bg-emerald-50 text-brand-green font-extrabold px-2 py-0.5 rounded-lg border border-brand-green/15 text-xs">
                          <span>{p.ratings?.average?.toFixed(1) || '0.0'}</span>
                          <Star className="w-3 h-3 fill-brand-green text-none" />
                        </div>
                        <span className="text-[10px] text-brand-muted font-bold">({p.ratings?.count || 0} reviews)</span>
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <td key={`empty-ratings-${i}`} className="py-4 px-4 text-center text-brand-muted/20">-</td>
                  ))}
                </tr>

                {/* Availability */}
                <tr className="hover:bg-brand-light/10">
                  <td className="py-4 px-4 font-black text-brand-muted uppercase text-[10px] tracking-wider align-middle">
                    {lang === 'hi' ? 'उपलब्धता' : lang === 'mr' ? 'उपलब्धता' : 'Availability'}
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p._id} className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 text-xs font-black rounded-full border ${
                        p.stock > 0 ? 'bg-green-50 text-brand-green border-green-200' : 'bg-red-50 text-red-500 border-red-200'
                      }`}>
                        {p.stock > 0 
                          ? (lang === 'hi' ? `स्टॉक में (${p.stock} बचे हैं)` : lang === 'mr' ? `स्टॉकमध्ये (${p.stock} शिल्लक)` : `IN STOCK (${p.stock} left)`)
                          : currentDict.product.outOfStock.toUpperCase()}
                      </span>
                    </td>
                  ))}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <td key={`empty-avail-${i}`} className="py-4 px-4 text-center text-brand-muted/20">-</td>
                  ))}
                </tr>

                {/* Description */}
                <tr className="hover:bg-brand-light/10">
                  <td className="py-4 px-4 font-black text-brand-muted uppercase text-[10px] tracking-wider align-top pt-4">
                    {currentDict.product.descriptionTitle}
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p._id} className="py-4 px-4 text-left text-xs font-semibold text-brand-muted leading-relaxed align-top max-w-[200px] whitespace-pre-wrap break-words">
                      {getTranslated(p.description, lang) || 'No description provided.'}
                    </td>
                  ))}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <td key={`empty-desc-${i}`} className="py-4 px-4 text-center text-brand-muted/20">-</td>
                  ))}
                </tr>

                {/* Cart Action */}
                <tr>
                  <td className="py-4 px-4 font-black text-brand-muted uppercase text-[10px] tracking-wider align-middle">
                    {lang === 'hi' ? 'चेकआउट एक्शन' : lang === 'mr' ? 'चेकआउट कृती' : 'Checkout Action'}
                  </td>
                  {comparedProducts.map((p) => {
                    const cartItem = getCartItem(p._id);
                    return (
                      <td key={p._id} className="py-4 px-4 text-center align-middle">
                        {p.stock <= 0 ? (
                          <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
                            {currentDict.product.outOfStock}
                          </span>
                        ) : cartItem ? (
                          <div className="inline-flex items-center bg-brand-green text-white rounded-xl overflow-hidden font-bold text-xs shadow-md mx-auto">
                            <button 
                              onClick={() => handleDecrement(p._id, cartItem.qty)}
                              disabled={isUpdating}
                              className="px-2.5 py-1.5 hover:bg-brand-green/90 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 min-w-[16px] text-center">{cartItem.qty}</span>
                            <button 
                              onClick={() => handleIncrement(p._id, cartItem.qty)}
                              disabled={isUpdating}
                              className="px-2.5 py-1.5 hover:bg-brand-green/90 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleAdd(p._id)}
                            disabled={isAdding}
                            className="bg-brand-green text-white hover:bg-brand-green/90 font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1 mx-auto"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{currentDict.buttons.addToCart.toUpperCase()}</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <td key={`empty-cart-${i}`} className="py-4 px-4 text-center text-brand-muted/20">-</td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-brand-muted font-bold text-sm bg-brand-light/20 rounded-2xl flex flex-col items-center justify-center gap-3">
            <ShoppingBag className="w-10 h-10 text-brand-muted/50" />
            <p>
              {lang === 'hi' ? 'आपका तुलना डैशबोर्ड खाली है!' : lang === 'mr' ? 'तुमचा तुलना डॅशबोर्ड रिकामी आहे!' : 'Your comparison dashboard is empty!'}
            </p>
            <button 
              onClick={() => navigate('/')} 
              className="mt-2 text-xs bg-brand-green text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
            >
              {currentDict.buttons.browseCatalog}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

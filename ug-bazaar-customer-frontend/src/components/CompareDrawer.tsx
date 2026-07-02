import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { toggleComparison, clearComparison } from '../store/slices/uiSlice';
import { apiClient } from '../api/apiClient';
import { ArrowLeftRight, X } from 'lucide-react';
import { getProductThumbnail } from '@ugbazaar/shared';

export default function CompareDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const comparisonList = useSelector((state: RootState) => state.ui.comparisonList);
  
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (comparisonList.length > 0) {
      const fetchProducts = async () => {
        try {
          const promises = comparisonList.map(id => apiClient(`/products/${id}`));
          const results = await Promise.all(promises);
          const prods = results.map(r => r.product).filter(Boolean);
          setProducts(prods);
        } catch (err) {
          console.error('Error fetching compared products in drawer:', err);
        }
      };
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [comparisonList]);

  if (comparisonList.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-10 bg-[#1e293b]/95 backdrop-blur text-white p-4 md:p-5 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10 z-40 animate-slide-up w-auto md:w-[500px]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow flex-shrink-0">
          <ArrowLeftRight className="w-5 h-5" />
        </div>
        <div>
          <p className="font-extrabold text-sm text-white">Compare Products ({comparisonList.length}/4)</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5 hidden md:block">Compare up to 4 items side-by-side</p>
        </div>
      </div>

      {/* Product Avatars List */}
      <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
        {products.map((p) => (
          <div key={p._id} className="relative group/avatar flex-shrink-0">
            <div className="w-11 h-11 bg-white border border-white/20 rounded-xl flex items-center justify-center p-1 shadow overflow-hidden">
              {getProductThumbnail(p.images) ? (
                <img src={getProductThumbnail(p.images)} alt={p.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-xl">📦</span>
              )}
            </div>
            <button
              onClick={() => dispatch(toggleComparison(p._id))}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white hover:bg-red-600 shadow border border-[#1e293b] cursor-pointer"
              title={`Remove ${p.name}`}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
        {Array.from({ length: 4 - comparisonList.length }).map((_, i) => (
          <div key={i} className="w-11 h-11 border border-dashed border-slate-600 rounded-xl flex items-center justify-center text-slate-500 text-xs flex-shrink-0 font-bold">
            +
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(clearComparison())}
          className="text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Clear
        </button>
        <button 
          onClick={() => navigate('/compare')}
          className="bg-brand-green hover:bg-brand-green/90 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1 active:scale-95"
        >
          Compare
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import { useCoupons } from '../api/productQueries';
import { Copy, Calendar, ArrowLeft, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Offers() {
  const { data: couponsData, isLoading } = useCoupons();
  const coupons = couponsData?.coupons || [];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Coupon code "${code}" copied to clipboard!`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in pb-24">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-dark mb-6 uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <h1 className="font-extrabold text-2xl text-brand-dark mb-8 flex items-center gap-2">
        <Percent className="w-6 h-6 text-brand-green" />
        <span>Store Coupons & Offers</span>
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-40 bg-white rounded-3xl skeleton-pulse border"></div>
          ))}
        </div>
      ) : coupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map((c) => (
            <div 
              key={c._id}
              className="bg-white border border-brand-border/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/5 rounded-full -mr-8 -mt-8"></div>
              
              <div>
                <span className="text-[10px] font-extrabold text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {c.type === 'percent' ? `${c.value}% OFF` : `Flat ₹${c.value} OFF`}
                </span>
                
                <h3 className="font-black text-xl text-brand-dark mt-3">{c.code}</h3>
                <p className="text-xs text-brand-muted font-semibold mt-1">
                  Valid on orders above ₹{c.minOrder}.
                </p>
              </div>

              <div className="border-t border-brand-light mt-6 pt-4 flex items-center justify-between gap-4">
                <span className="text-[10px] text-brand-muted font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Expires: {new Date(c.expiresAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </span>
                
                <button
                  onClick={() => handleCopy(c.code)}
                  className="bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all duration-150 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center font-bold text-sm text-brand-muted py-8">
          No coupons are currently active. Please check back later!
        </p>
      )}
    </div>
  );
}

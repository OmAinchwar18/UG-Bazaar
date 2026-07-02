import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../api/productQueries';
import ProductCard from '../components/ProductCard';
import { 
  Sparkles, ShieldCheck, ChevronRight, Truck, 
  Leaf, Zap, Hammer, Armchair, Coffee, HardDrive, ShoppingBag,
  ChefHat, Wrench, Package
} from 'lucide-react';

const categoryMap = [
  { name: 'Grocery', emoji: '🍎', label: 'Grocery & Staples', icon: Coffee, bg: 'bg-green-50 text-green-700 border-green-100' },
  { name: 'Agriculture', emoji: '🌱', label: 'Agri Inputs', icon: Leaf, bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { name: 'Building Materials', emoji: '🧱', label: 'Building Materials', icon: Package, bg: 'bg-amber-50 text-amber-700 border-amber-100' },
  { name: 'Hardware Tools', emoji: '🔧', label: 'Hardware Tools', icon: Hammer, bg: 'bg-blue-50 text-blue-700 border-blue-100' },
  { name: 'Plumbing', emoji: '🚰', label: 'Plumbing Fittings', icon: Wrench, bg: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  { name: 'Electrical', emoji: '💡', label: 'Electrical & Wires', icon: Zap, bg: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
  { name: 'Furniture', emoji: '🪑', label: 'Furniture Wood', icon: Armchair, bg: 'bg-orange-50 text-orange-700 border-orange-100' },
  { name: 'Home Appliances', emoji: '🍳', label: 'Home Appliances', icon: ChefHat, bg: 'bg-red-50 text-red-700 border-red-100' },
  { name: 'Electronics', emoji: '💻', label: 'Electronics Tech', icon: HardDrive, bg: 'bg-violet-50 text-violet-700 border-violet-100' },
  { name: 'General Store', emoji: '🛍️', label: 'Daily General', icon: ShoppingBag, bg: 'bg-pink-50 text-pink-700 border-pink-100' }
];

export default function Home() {
  const navigate = useNavigate();

  const { data: popularData, isLoading: popLoading } = useProducts({ badge: 'Popular', limit: 8 });
  const { data: buildData, isLoading: buildLoading } = useProducts({ dept: 'Building Materials', limit: 4 });
  const { data: agriData, isLoading: agriLoading } = useProducts({ dept: 'Agriculture', limit: 4 });
  const { data: groceryData, isLoading: grocLoading } = useProducts({ dept: 'Grocery', limit: 4 });

  const handleCategoryClick = (deptName: string) => {
    navigate(`/search?dept=${encodeURIComponent(deptName)}`);
  };

  return (
    <div className="pb-16 animate-fade-in">
      
      {/* Dynamic Sliding Banners */}
      <section className="bg-brand-yellow/10 py-10 border-b border-brand-yellow/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-brand-green to-emerald-800 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Background elements */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-xl"></div>
            <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-brand-yellow/15 rounded-full -ml-20 -mb-20 blur-2xl"></div>

            <div className="relative z-10 max-w-lg">
              <span className="bg-brand-yellow text-brand-dark text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Gangadhar Traders
              </span>
              <h1 className="font-extrabold text-3xl md:text-5xl mt-4 leading-tight">
                Construction Materials, Hardware & <span className="text-brand-yellow">Daily Essentials</span>
              </h1>
              <p className="text-white/80 text-sm mt-3 font-semibold">
                Superfast delivery straight from CDCC Bank Road, Talodhi directly to your project site or home.
              </p>
              <button 
                onClick={() => navigate('/search')}
                className="mt-6 bg-brand-yellow hover:bg-opacity-95 text-brand-dark font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <span>Browse Catalog</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 flex flex-col items-center bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl md:w-80">
              <div className="flex items-center gap-2 text-brand-yellow font-extrabold text-sm mb-3">
                <Sparkles className="w-5 h-5 fill-brand-yellow" />
                <span>LIMITED TIME OFFER</span>
              </div>
              <p className="text-2xl font-black text-center text-white">Flat ₹100 OFF</p>
              <p className="text-xs text-white/80 font-bold text-center mt-1">On orders above ₹500 across Grocery</p>
              <div className="bg-white text-brand-dark px-4 py-2 rounded-xl mt-4 font-black text-sm border-2 border-brand-yellow border-dashed tracking-wider select-all cursor-pointer">
                BAZAAR100
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Category Explorer Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="font-extrabold text-xl md:text-2xl text-brand-dark flex items-center gap-2">
          <span>Explore Departments</span>
          <span className="text-xs text-brand-muted font-bold bg-brand-light border px-2.5 py-1 rounded-full">Choose Category</span>
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-5 gap-4 mt-6">
          {categoryMap.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`border rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-95 ${cat.bg} group`}
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform duration-200">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-extrabold text-sm mt-3 text-brand-dark">{cat.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Products Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
          <h2 className="font-extrabold text-xl md:text-2xl text-brand-dark flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-yellow fill-brand-yellow" />
            <span>Popular in Talodhi</span>
          </h2>
          <button 
            onClick={() => navigate('/search')}
            className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {popLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-brand-border/60 rounded-2xl p-4 space-y-4 h-72">
                <div className="w-full h-36 rounded-xl skeleton-pulse"></div>
                <div className="h-4 w-3/4 rounded skeleton-pulse"></div>
                <div className="h-6 w-1/2 rounded skeleton-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {popularData?.products?.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* Building Materials Deals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 bg-amber-50/50 border border-amber-100/60 rounded-3xl p-8">
        <div className="flex items-center justify-between border-b border-amber-100 pb-3">
          <div>
            <h2 className="font-extrabold text-xl text-amber-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-orange" />
              <span>Building & Construction Materials</span>
            </h2>
            <p className="text-xs text-brand-muted font-semibold mt-0.5">High grade cement, steel TMT bars and clay bricks</p>
          </div>
          <button 
            onClick={() => navigate('/search?dept=Building Materials')}
            className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
          >
            <span>View All Materials</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {buildLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border rounded-2xl p-4 space-y-4 h-72">
                <div className="w-full h-36 rounded-xl skeleton-pulse"></div>
                <div className="h-4 w-3/4 rounded skeleton-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {buildData?.products?.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* Agriculture Input Deals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 bg-emerald-50/50 border border-emerald-100/60 rounded-3xl p-8">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div>
            <h2 className="font-extrabold text-xl text-emerald-800 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-brand-green" />
              <span>Agriculture & Farming Inputs</span>
            </h2>
            <p className="text-xs text-brand-muted font-semibold mt-0.5">High yield hybrid seeds & organic compost fertilizers</p>
          </div>
          <button 
            onClick={() => navigate('/search?dept=Agriculture')}
            className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
          >
            <span>View All Agri</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {agriLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border rounded-2xl p-4 space-y-4 h-72">
                <div className="w-full h-36 rounded-xl skeleton-pulse"></div>
                <div className="h-4 w-3/4 rounded skeleton-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {agriData?.products?.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* Grocery Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
          <div>
            <h2 className="font-extrabold text-xl text-brand-dark flex items-center gap-2">
              <span>Grocery & Daily Staples</span>
            </h2>
            <p className="text-xs text-brand-muted font-semibold mt-0.5">Daily pulses, premium oil & basmati rice packages</p>
          </div>
          <button 
            onClick={() => navigate('/search?dept=Grocery')}
            className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
          >
            <span>View All Grocery</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {grocLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border rounded-2xl p-4 space-y-4 h-72">
                <div className="w-full h-36 rounded-xl skeleton-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {groceryData?.products?.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white border border-brand-border/60 rounded-3xl p-8">
          <div className="flex items-start gap-4">
            <div className="bg-brand-green/10 text-brand-green p-3 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-brand-dark">Instant Site Delivery</h4>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed font-semibold">
                Delivering building materials and supplies directly to your construction site or house.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 border-t md:border-t-0 md:border-l border-brand-border/60 pt-6 md:pt-0 md:pl-8">
            <div className="bg-brand-green/10 text-brand-green p-3 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-brand-dark">100% Secure Payments</h4>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed font-semibold">
                Payments verified by Razorpay. Choose cash on delivery, card, or UPI.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 border-t md:border-t-0 md:border-l border-brand-border/60 pt-6 md:pt-0 md:pl-8">
            <div className="bg-brand-green/10 text-brand-green p-3 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-brand-dark">Quality Assured Brands</h4>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed font-semibold">
                Stocking leading brands: UltraTech, Tata, Bosch, Stanley, Astral, Jaquar, Bajaj, Wipro.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

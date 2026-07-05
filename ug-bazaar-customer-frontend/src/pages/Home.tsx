import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../api/productQueries';
import ProductCard from '../components/ProductCard';
import { useTranslation } from '../hooks/useTranslation';
import { getTranslated } from '@ugbazaar/shared';
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

const getCategoryLabel = (name: string, lang: string) => {
  const map: Record<string, Record<string, string>> = {
    Grocery: { en: 'Grocery & Staples', hi: 'किराना और राशन', mr: 'किराणा आणि किराणा सामान' },
    Agriculture: { en: 'Agri Inputs', hi: 'कृषि इनपुट', mr: 'कृषी निविष्ठा' },
    'Building Materials': { en: 'Building Materials', hi: 'भवन निर्माण सामग्री', mr: 'बांधकाम साहित्य' },
    'Hardware Tools': { en: 'Hardware Tools', hi: 'हार्डवेयर और उपकरण', mr: 'हार्डवेअर आणि साधने' },
    Plumbing: { en: 'Plumbing Fittings', hi: 'प्लंबिंग फिटिंग', mr: 'प्लंबिंग फिटिंग्ज' },
    Electrical: { en: 'Electrical & Wires', hi: 'इलेक्ट्रिकल और तार', mr: 'इलेक्ट्रिकल आणि वायर्स' },
    Furniture: { en: 'Furniture Wood', hi: 'फर्नीचर और लकड़ी', mr: 'फर्निचर आणि लाकूड' },
    'Home Appliances': { en: 'Home Appliances', hi: 'घरेलू उपकरण', mr: 'घरगुती उपकरणे' },
    Electronics: { en: 'Electronics Tech', hi: 'इलेक्ट्रॉनिक्स', mr: 'इलेक्ट्रॉनिक्स' },
    'General Store': { en: 'Daily General', hi: 'दैनिक जरुरत', mr: 'दैनिक जनरल' }
  };
  return map[name]?.[lang] || map[name]?.en || name;
};

export default function Home() {
  const navigate = useNavigate();
  const { currentDict, lang } = useTranslation();

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
                {lang === 'hi' ? 'भवन निर्माण, हार्डवेयर और ' : lang === 'mr' ? 'बांधकाम साहित्य, हार्डवेअर आणि ' : 'Construction Materials, Hardware & '}
                <span className="text-brand-yellow">
                  {lang === 'hi' ? 'दैनिक जरुरत' : lang === 'mr' ? 'दैनिक गरजा' : 'Daily Essentials'}
                </span>
              </h1>
              <p className="text-white/80 text-sm mt-3 font-semibold">
                {lang === 'hi' 
                  ? 'सीडीसीसी बैंक रोड, तलोधी से सीधे आपके प्रोजेक्ट साइट या घर पर सुपरफास्ट डिलीवरी।' 
                  : lang === 'mr' 
                  ? 'सीडीसीसी बँक रोड, तळोधी येथून थेट तुमच्या प्रोजेक्ट साइटवर किंवा घरी सुपरफास्ट डिलिव्हरी.' 
                  : 'Superfast delivery straight from CDCC Bank Road, Talodhi directly to your project site or home.'}
              </p>
              <button 
                onClick={() => navigate('/search')}
                className="mt-6 bg-brand-yellow hover:bg-opacity-95 text-brand-dark font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <span>{currentDict.buttons.browseCatalog}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 flex flex-col items-center bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl md:w-80">
              <div className="flex items-center gap-2 text-brand-yellow font-extrabold text-sm mb-3">
                <Sparkles className="w-5 h-5 fill-brand-yellow" />
                <span>
                  {lang === 'hi' ? 'सीमित समय की पेशकश' : lang === 'mr' ? 'मर्यादित वेळेची ऑफर' : 'LIMITED TIME OFFER'}
                </span>
              </div>
              <p className="text-2xl font-black text-center text-white">
                {lang === 'hi' ? 'सीधे ₹100 की छूट' : lang === 'mr' ? 'थेट ₹१०० सूट' : 'Flat ₹100 OFF'}
              </p>
              <p className="text-xs text-white/80 font-bold text-center mt-1">
                {lang === 'hi' 
                  ? 'किराना पर ₹500 से अधिक के ऑर्डर पर' 
                  : lang === 'mr' 
                  ? 'किराणा मालावर ₹५०० पेक्षा जास्त ऑर्डरवर' 
                  : 'On orders above ₹500 across Grocery'}
              </p>
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
          <span>{lang === 'hi' ? 'विभागों को खोजें' : lang === 'mr' ? 'विभाग शोधा' : 'Explore Departments'}</span>
          <span className="text-xs text-brand-muted font-bold bg-brand-light border px-2.5 py-1 rounded-full">
            {lang === 'hi' ? 'श्रेणी चुनें' : lang === 'mr' ? 'श्रेणी निवडा' : 'Choose Category'}
          </span>
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
                <span className="font-extrabold text-sm mt-3 text-brand-dark">{getCategoryLabel(cat.name, lang)}</span>
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
            <span>
              {lang === 'hi' ? 'तलोधी में लोकप्रिय' : lang === 'mr' ? 'तळोधीमध्ये लोकप्रिय' : 'Popular in Talodhi'}
            </span>
          </h2>
          <button 
            onClick={() => navigate('/search')}
            className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
          >
            <span>{currentDict.buttons.viewAll}</span>
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
              <span>
                {lang === 'hi' ? 'भवन और निर्माण सामग्री' : lang === 'mr' ? 'इमारत आणि बांधकाम साहित्य' : 'Building & Construction Materials'}
              </span>
            </h2>
            <p className="text-xs text-brand-muted font-semibold mt-0.5">
              {lang === 'hi' 
                ? 'उच्च गुणवत्ता वाला सीमेंट, स्टील टीएमटी बार और मिट्टी की ईंटें' 
                : lang === 'mr' 
                ? 'उत्कृष्ट दर्जाचे सिमेंट, स्टील टीएमटी बार आणि मातीची वीट' 
                : 'High grade cement, steel TMT bars and clay bricks'}
            </p>
          </div>
          <button 
            onClick={() => navigate('/search?dept=Building Materials')}
            className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
          >
            <span>{lang === 'hi' ? 'सभी सामग्री देखें' : lang === 'mr' ? 'सर्व साहित्य पहा' : 'View All Materials'}</span>
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
              <span>
                {lang === 'hi' ? 'कृषि और खेती इनपुट्स' : lang === 'mr' ? 'कृषी आणि शेती निविष्ठा' : 'Agriculture & Farming Inputs'}
              </span>
            </h2>
            <p className="text-xs text-brand-muted font-semibold mt-0.5">
              {lang === 'hi' 
                ? 'अधिक उपज देने वाले हाइब्रिड बीज और जैविक खाद' 
                : lang === 'mr' 
                ? 'जास्त उत्पादन देणारे हायब्रिड बियाणे आणि सेंद्रिय खत' 
                : 'High yield hybrid seeds & organic compost fertilizers'}
            </p>
          </div>
          <button 
            onClick={() => navigate('/search?dept=Agriculture')}
            className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
          >
            <span>{lang === 'hi' ? 'सभी कृषि सामग्री देखें' : lang === 'mr' ? 'सर्व कृषी साहित्य पहा' : 'View All Agri'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {agriLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border rounded-2xl p-4 space-y-4 h-72">
                <div className="w-full h-36 rounded-xl skeleton-pulse"></div>
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
              <span>{lang === 'hi' ? 'किराना और दैनिक राशन' : lang === 'mr' ? 'किराणा आणि दैनिक किराणा सामान' : 'Grocery & Daily Staples'}</span>
            </h2>
            <p className="text-xs text-brand-muted font-semibold mt-0.5">
              {lang === 'hi' 
                ? 'दैनिक दालें, शुद्ध तेल और बासमती चावल पैकेट' 
                : lang === 'mr' 
                ? 'रोजच्या डाळी, शुद्ध तेल आणि बासमती तांदूळ पाकिटे' 
                : 'Daily pulses, premium oil & basmati rice packages'}
            </p>
          </div>
          <button 
            onClick={() => navigate('/search?dept=Grocery')}
            className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
          >
            <span>{lang === 'hi' ? 'सभी किराना देखें' : lang === 'mr' ? 'सर्व किराणा पहा' : 'View All Grocery'}</span>
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
              <h4 className="font-extrabold text-sm text-brand-dark">
                {lang === 'hi' ? 'सीधे साइट पर डिलीवरी' : lang === 'mr' ? 'थेट साइटवर डिलिव्हरी' : 'Instant Site Delivery'}
              </h4>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed font-semibold">
                {lang === 'hi' 
                  ? 'निर्माण सामग्री और आपूर्ति सीधे आपके निर्माण स्थल या घर तक पहुँचाना।' 
                  : lang === 'mr' 
                  ? 'बांधकाम साहित्य आणि वस्तू थेट तुमच्या बांधकाम साइटवर किंवा घरी पोहोचवणे.' 
                  : 'Delivering building materials and supplies directly to your construction site or house.'}
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
                {lang === 'hi' 
                  ? 'भुगतान रेज़रपे द्वारा सत्यापित। कैश ऑन डिलीवरी, कार्ड या यूपीआई चुनें।' 
                  : lang === 'mr' 
                  ? 'पेमेंट रेझरपे द्वारे सुरक्षित. कॅश ऑन डिलिव्हरी, कार्ड किंवा यूपीआय निवडा.' 
                  : 'Payments verified by Razorpay. Choose cash on delivery, card, or UPI.'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 border-t md:border-t-0 md:border-l border-brand-border/60 pt-6 md:pt-0 md:pl-8">
            <div className="bg-brand-green/10 text-brand-green p-3 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-brand-dark">
                {lang === 'hi' ? 'गुणवत्तापूर्ण ब्रांड्स' : lang === 'mr' ? 'गुणवत्तापूर्ण ब्रँड्स' : 'Quality Assured Brands'}
              </h4>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed font-semibold">
                {lang === 'hi' 
                  ? 'अग्रणी ब्रांडों का स्टॉक: अल्ट्राटेक, टाटा, बॉश, स्टेनली, एस्ट्रल, जगुआर, बजाज, विप्रो।' 
                  : lang === 'mr' 
                  ? 'प्रमुख ब्रँड्सचा साठा: अल्ट्राटेक, टाटा, बॉश, स्टेनली, एस्ट्रल, जगुआर, बजाज, विप्रो.' 
                  : 'Stocking leading brands: UltraTech, Tata, Bosch, Stanley, Astral, Jaquar, Bajaj, Wipro.'}
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

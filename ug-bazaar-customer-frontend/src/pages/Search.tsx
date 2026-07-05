import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useProductSearch } from '../api/productQueries';
import ProductCard from '../components/ProductCard';
import { useTranslation } from '../hooks/useTranslation';
import { getTranslated } from '@ugbazaar/shared';
import { SlidersHorizontal, PackageX, Sparkles, Filter } from 'lucide-react';

const departments = [
  'Grocery', 'Agriculture', 'Building Materials', 'Hardware Tools', 'Plumbing',
  'Electrical', 'Furniture', 'Home Appliances', 'Electronics', 'General Store'
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

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const dept = searchParams.get('dept') || '';
  const { currentDict, lang } = useTranslation();

  const [inStock, setInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedDept, setSelectedDept] = useState<string>(dept);

  // If there's an active query 'q', we search. Otherwise, we fetch all with filters.
  const { data: searchResults, isLoading: searchLoading } = useProductSearch(q, selectedDept);
  
  const { data: filterResults, isLoading: filterLoading } = useProducts({
    dept: selectedDept,
    inStock,
    sort: sortBy,
    limit: 40
  });

  // Sync selected dept with URL query changes
  useEffect(() => {
    setSelectedDept(dept);
  }, [dept]);

  const isLoading = q ? searchLoading : filterLoading;
  const products = q ? searchResults?.products : filterResults?.products;
  const totalCount = products?.length || 0;

  const handleDeptFilter = (deptName: string) => {
    const nextDept = selectedDept === deptName ? '' : deptName;
    setSelectedDept(nextDept);
    
    // Update Search Params
    const nextParams = new URLSearchParams(searchParams);
    if (nextDept) {
      nextParams.set('dept', nextDept);
    } else {
      nextParams.delete('dept');
    }
    setSearchParams(nextParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      
      {/* Search Header info */}
      <div className="mb-8 border-b border-brand-border/60 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {q ? (
            <h1 className="font-extrabold text-2xl text-brand-dark">
              {lang === 'hi' ? `"${q}" के लिए खोज परिणाम` : lang === 'mr' ? `"${q}" साठी शोध निकाल` : `Search Results for "${q}"`}
            </h1>
          ) : (
            <h1 className="font-extrabold text-2xl text-brand-dark">
              {lang === 'hi' ? 'कैटलॉग खोजें' : lang === 'mr' ? 'कॅटलॉग शोधा' : 'Explore Catalog'} {selectedDept && <span className="text-brand-green">— {getCategoryLabel(selectedDept, lang)}</span>}
            </h1>
          )}
          <p className="text-xs text-brand-muted mt-1 font-semibold">
            {lang === 'hi' ? `मापदंड से मेल खाने वाले ${totalCount} उत्पाद मिले` : lang === 'mr' ? `निकषांशी जुळणारे ${totalCount} उत्पादन आढळले` : `Found ${totalCount} items matching criteria`}
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">
            {lang === 'hi' ? 'क्रमबद्ध करें' : lang === 'mr' ? 'क्रमवारी लावा' : 'Sort By'}
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-brand-border/60 hover:border-brand-green/45 rounded-xl px-4 py-2 text-sm font-bold outline-none transition-all cursor-pointer"
          >
            <option value="newest">{lang === 'hi' ? 'नवीनतम उत्पाद' : lang === 'mr' ? 'नवीनतम उत्पादने' : 'Newest Arrivals'}</option>
            <option value="price-low">{lang === 'hi' ? 'कीमत: कम से अधिक' : lang === 'mr' ? 'किंमत: कमी ते जास्त' : 'Price: Low to High'}</option>
            <option value="price-high">{lang === 'hi' ? 'कीमत: अधिक से कम' : lang === 'mr' ? 'किंमत: जास्त ते कमी' : 'Price: High to Low'}</option>
            <option value="rating">{lang === 'hi' ? 'शीर्ष रेटेड' : lang === 'mr' ? 'टॉप रेटेड' : 'Top Rated'}</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <aside className="space-y-6">
          <div className="bg-white border border-brand-border/60 rounded-2xl p-5 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-brand-light pb-3">
              <span className="font-extrabold text-sm text-brand-dark flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-brand-green" />
                <span>{lang === 'hi' ? 'फ़िल्टर' : lang === 'mr' ? 'फिल्टर्स' : 'Filters'}</span>
              </span>
              <button 
                onClick={() => {
                  setInStock(false);
                  setSelectedDept('');
                  setSearchParams({});
                }}
                className="text-xs font-bold text-brand-green hover:underline"
              >
                {lang === 'hi' ? 'सभी साफ़ करें' : lang === 'mr' ? 'सर्व साफ करा' : 'Clear All'}
              </button>
            </div>

            {/* In Stock Filter */}
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">
                {lang === 'hi' ? 'उपलब्धता' : lang === 'mr' ? 'उपलब्धता' : 'Availability'}
              </span>
              <label className="flex items-center gap-3 font-semibold text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-4 h-4 text-brand-green rounded border-brand-border focus:ring-brand-green"
                />
                <span>{lang === 'hi' ? 'आउट ऑफ स्टॉक छुपाएं' : lang === 'mr' ? 'आउट ऑफ स्टॉक लपवा' : 'Hide Out of Stock'}</span>
              </label>
            </div>

            {/* Department list */}
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">
                {lang === 'hi' ? 'विभाग' : lang === 'mr' ? 'विभाग' : 'Departments'}
              </span>
              <div className="flex flex-col gap-2">
                {departments.map((deptName) => {
                  const isActive = selectedDept === deptName;
                  return (
                    <button
                      key={deptName}
                      onClick={() => handleDeptFilter(deptName)}
                      className={`text-left px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all duration-150 flex items-center justify-between ${
                      isActive 
                        ? 'bg-brand-green/10 text-brand-green border-brand-green/30 border' 
                        : 'bg-brand-light border border-transparent hover:bg-brand-border/30 text-brand-dark'
                      }`}
                    >
                      <span>{getCategoryLabel(deptName, lang)}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border rounded-2xl p-4 space-y-4 h-72">
                  <div className="w-full h-36 rounded-xl skeleton-pulse"></div>
                  <div className="h-4 w-3/4 rounded skeleton-pulse"></div>
                  <div className="h-6 w-1/3 rounded skeleton-pulse"></div>
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="bg-white border rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[300px]">
              <div className="bg-brand-light p-4 rounded-full text-brand-muted">
                <PackageX className="w-10 h-10" />
              </div>
              <h3 className="font-extrabold text-lg text-brand-dark mt-4">
                {lang === 'hi' ? 'कोई उत्पाद नहीं मिला' : lang === 'mr' ? 'कोणतीही उत्पादने आढळली नाहीत' : 'No Products Found'}
              </h3>
              <p className="text-sm text-brand-muted font-semibold mt-1 max-w-sm">
                {lang === 'hi' 
                  ? 'आपके फ़िल्टर मानदंडों के अनुसार कोई उत्पाद नहीं मिला। कृपया दूसरा कीवर्ड डालें या फ़िल्टर साफ़ करें।' 
                  : lang === 'mr' 
                  ? 'तुमच्या फिल्टर निकषांनुसार कोणतेही उत्पादन आढळले नाही. कृपया दुसरी क्वेरी टाका किंवा फिल्टर साफ करा.' 
                  : 'No products were found matching your criteria. Try another search query or clear filters.'}
              </p>
              <button 
                onClick={() => {
                  setInStock(false);
                  setSelectedDept('');
                  setSearchParams({});
                }}
                className="btn-primary mt-6 text-sm"
              >
                {lang === 'hi' ? 'सभी उत्पाद दिखाएं' : lang === 'mr' ? 'सर्व उत्पादने दाखवा' : 'Show All Products'}
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

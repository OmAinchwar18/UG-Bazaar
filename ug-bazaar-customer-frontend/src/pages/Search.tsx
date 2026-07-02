import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useProductSearch } from '../api/productQueries';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, PackageX, Sparkles, Filter } from 'lucide-react';

const departments = [
  'Grocery', 'Agriculture', 'Building Materials', 'Hardware Tools', 'Plumbing',
  'Electrical', 'Furniture', 'Home Appliances', 'Electronics', 'General Store'
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const dept = searchParams.get('dept') || '';

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
              Search Results for <span className="text-brand-green">"{q}"</span>
            </h1>
          ) : (
            <h1 className="font-extrabold text-2xl text-brand-dark">
              Explore Catalog {selectedDept && <span className="text-brand-green">— {selectedDept}</span>}
            </h1>
          )}
          <p className="text-xs text-brand-muted mt-1 font-semibold">Found {totalCount} items matching criteria</p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-brand-border/60 hover:border-brand-green/45 rounded-xl px-4 py-2 text-sm font-bold outline-none transition-all cursor-pointer"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
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
                <span>Filters</span>
              </span>
              <button 
                onClick={() => {
                  setInStock(false);
                  setSelectedDept('');
                  setSearchParams({});
                }}
                className="text-xs font-bold text-brand-green hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* In Stock Filter */}
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">Availability</span>
              <label className="flex items-center gap-3 font-semibold text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-4 h-4 text-brand-green rounded border-brand-border focus:ring-brand-green"
                />
                <span>Hide Out of Stock</span>
              </label>
            </div>

            {/* Department list */}
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">Departments</span>
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
                      <span>{deptName}</span>
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
              <h3 className="font-extrabold text-lg text-brand-dark mt-4">No Products Found</h3>
              <p className="text-sm text-brand-muted font-semibold mt-1 max-w-sm">
                Aapke filter criteria ke anusar koi product nahi mila. Kripya doosra query daalein ya filter clear karein.
              </p>
              <button 
                onClick={() => {
                  setInStock(false);
                  setSelectedDept('');
                  setSearchParams({});
                }}
                className="btn-primary mt-6 text-sm"
              >
                Show All Products
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

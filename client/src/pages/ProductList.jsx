import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../redux/slices/productSlice.js';
import ProductCard from '../components/ProductCard.jsx';
import { CardSkeleton } from '../components/Skeleton.jsx';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw, Layers } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

export default function ProductList() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { products, categories, totalPages, currentPage, loading, totalProducts } = useSelector(
    (state) => state.products
  );

  // Filter Local State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [availability, setAvailability] = useState(searchParams.get('availability') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // View Mode: Pagination or Infinite Scroll
  const [viewMode, setViewMode] = useState('pagination'); // 'pagination' | 'infinite'
  const observerTarget = useRef(null);
  const loadingRef = useRef(false);

  // Load categories once
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Synchronize state and trigger search when URL search params change
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    // In infinite scroll mode, if URL parameters reset or page is 1, fetch fresh
    if (viewMode === 'infinite' && (!params.page || params.page === '1')) {
      dispatch(fetchProducts({ ...params, append: false }));
      setPage(1);
    } else if (viewMode === 'pagination') {
      dispatch(fetchProducts(params));
    }
  }, [searchParams, dispatch, viewMode]);

  // Infinite Scroll intersection observer
  useEffect(() => {
    if (viewMode !== 'infinite') return;
    
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !loading && currentPage < totalPages && !loadingRef.current) {
          loadingRef.current = true;
          const nextPage = currentPage + 1;
          setPage(nextPage);

          const params = Object.fromEntries(searchParams.entries());
          await dispatch(fetchProducts({ ...params, page: nextPage, append: true }));
          loadingRef.current = false;
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [viewMode, currentPage, totalPages, loading, searchParams, dispatch]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const newParams = {};
    if (search) newParams.search = search;
    if (category) newParams.category = category;
    if (minPrice) newParams.minPrice = minPrice;
    if (maxPrice) newParams.maxPrice = maxPrice;
    if (rating) newParams.rating = rating;
    if (availability) newParams.availability = availability;
    if (sort) newParams.sort = sort;
    newParams.page = '1'; // Reset page to 1 on filter apply
    setPage(1);
    setSearchParams(newParams);
  };



  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    const newParams = Object.fromEntries(searchParams.entries());
    newParams.page = newPage.toString();
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setAvailability('');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

      {/* Breadcrumbs */}
      <Breadcrumbs paths={[{ label: 'Catalog / Bulk Products' }]} />

      <div className="flex flex-col md:flex-row gap-8 mt-4">

        {/* 1. Filters Sidebar (Desktop) */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="glass-panel p-6 rounded-2xl sticky top-20 flex flex-col gap-5">

            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-500" />
                <span>Filter Catalog</span>
              </h2>
              <button
                onClick={handleClearFilters}
                className="text-[10px] font-bold text-slate-400 hover:text-emerald-500 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                Reset
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="flex flex-col gap-4">

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 dark:bg-dark-bg dark:border-slate-800"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Retail Price Range */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Retail Price (₹)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 py-1.5 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none bg-slate-50/50 dark:bg-dark-bg dark:border-slate-800"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 py-1.5 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none bg-slate-50/50 dark:bg-dark-bg dark:border-slate-800"
                  />
                </div>
              </div>



              {/* Ratings */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Min. Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none bg-slate-50/50 dark:bg-dark-bg dark:border-slate-800"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5★ & Above</option>
                  <option value="4.0">4.0★ & Above</option>
                  <option value="3.5">3.5★ & Above</option>
                </select>
              </div>

              {/* Stock Availability */}
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="availability"
                  checked={availability === 'true'}
                  onChange={(e) => setAvailability(e.target.checked ? 'true' : '')}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="availability" className="text-xs font-semibold text-slate-650 dark:text-slate-350 cursor-pointer">
                  In Stock Only
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors mt-2 cursor-pointer"
              >
                Apply Filters
              </button>

            </form>

          </div>
        </aside>

        {/* 2. Main Content Grid */}
        <main className="flex-1 flex flex-col gap-6">

          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl shadow-sm transition-colors">

            {/* Left Info */}
            <div>
              <p className="text-xs font-medium text-slate-400">Showing catalog</p>
              <h1 className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">
                {loading ? 'Searching offers...' : `${totalProducts} Products Available`}
              </h1>
            </div>

            {/* Right Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-850 px-2.5 py-1.5 rounded-lg bg-slate-50/50 dark:bg-dark-bg">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="text-xs focus:outline-none bg-transparent cursor-pointer font-medium"
                >
                  <option value="pagination">Pagination</option>
                  <option value="infinite">Infinite Scroll</option>
                </select>
              </div>
               
              {/* <div className="flex-1 sm:flex-none relative">
                <input
                  type="text"
                  placeholder="Refine search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 w-full sm:w-48 text-xs rounded-lg border border-slate-200 focus:outline-none bg-slate-50/50 dark:bg-dark-bg dark:border-slate-800"
                />
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              </div> */}

              {/* Sorting Dropdown */}
              <div className="flex items-center  border border-slate-200 dark:border-slate-800 px-1.5 py-1.5 rounded-lg bg-slate-50/50 dark:bg-dark-bg">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    const newParams = Object.fromEntries(searchParams.entries());
                    newParams.sort = e.target.value;
                    setSearchParams(newParams);
                  }}
                  className="text-xs focus:outline-none bg-transparent"
                >
                  <option value="newest">Newest Offers</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="popular">Best Sellers</option>
                </select>
              </div>
            </div>

          </div>

          {/* Catalog grid */}
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 rounded-2xl flex flex-col items-center justify-center gap-4">
              <Search className="h-10 w-10 text-slate-350 dark:text-slate-600 animate-bounce" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No products found matching filters</p>
              <p className="text-xs text-slate-400">Try clearing query terms or price limits to refresh the catalog.</p>
              <button
                onClick={handleClearFilters}
                className="mt-2 rounded-xl border border-slate-200 px-5 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800"
              >
                Clear All filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Infinite Scroll Loader Target */}
              {viewMode === 'infinite' && (
                <div ref={observerTarget} className="w-full flex justify-center py-6">
                  {loading && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full animate-pulse">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <CardSkeleton key={i} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Pagination Footer */}
          {viewMode === 'pagination' && !loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 py-4">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50 dark:border-slate-800 cursor-pointer"
              >
                Previous
              </button>

              <div className="flex gap-1 text-xs">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`h-8 w-8 rounded-lg font-semibold cursor-pointer ${currentPage === idx + 1 ? 'bg-emerald-600 text-white' : 'border border-slate-200 hover:bg-slate-50 dark:border-slate-800'}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50 dark:border-slate-800 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}

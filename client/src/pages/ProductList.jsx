import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../redux/slices/productSlice.js';
import ProductCard from '../components/ProductCard.jsx';
import { CardSkeleton } from '../components/Skeleton.jsx';
import {
  SlidersHorizontal,
  ArrowUpDown,
  RefreshCw,
  Layers,
  X,
  Check,
  Search,
  Filter
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

export default function ProductList() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { products: rawProducts, categories, totalPages, currentPage, loading, totalProducts } = useSelector(
    (state) => state.products
  );

  // Drawer modal states for mobile explicit user clicks
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false);

  // Local Filter & Sort state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [availability, setAvailability] = useState(searchParams.get('availability') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // View Mode: Pagination vs Infinite
  const [viewMode, setViewMode] = useState('pagination');
  const observerTarget = useRef(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
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

  // Frontend Sorting Backup to guarantee precise Price Low-to-High / High-to-Low
  const sortedProducts = React.useMemo(() => {
    if (!rawProducts) return [];
    let list = [...rawProducts];

    if (sort === 'price-low') {
      return list.sort((a, b) => (a.price || a.discountPrice || 0) - (b.price || b.discountPrice || 0));
    }
    if (sort === 'price-high') {
      return list.sort((a, b) => (b.price || b.discountPrice || 0) - (a.price || a.discountPrice || 0));
    }
    if (sort === 'discount') {
      return list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }
    return list;
  }, [rawProducts, sort]);

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
    newParams.page = '1';
    setPage(1);
    setSearchParams(newParams);
    setIsFilterDrawerOpen(false);
  };

  const handleSelectSort = (sortOption) => {
    setSort(sortOption);
    const newParams = Object.fromEntries(searchParams.entries());
    newParams.sort = sortOption;
    setSearchParams(newParams);
    setIsSortDrawerOpen(false);
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
    setIsFilterDrawerOpen(false);
  };

  const sortOptions = [
    { label: 'Recommended / Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
    { label: 'Top Rated', value: 'rating' },
    { label: 'Best Sellers', value: 'popular' },
    { label: 'Highest Discount', value: 'discount' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 pb-24">

      {/* Breadcrumbs */}
      <Breadcrumbs paths={[{ label: 'Food Marketplace Catalog' }]} />

      {/* Mobile App Filter & Sort Control Bar */}
      <div className="flex items-center justify-between gap-2 my-4 bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800 p-2.5 rounded-2xl shadow-xs sticky top-14 z-30">
        
        {/* Filter Drawer Trigger Button */}
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-foodie-green-light dark:bg-emerald-950/40 text-[#0B542F] dark:text-emerald-400 font-bold text-xs hover:bg-[#d5f2d7] transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filter</span>
          {(category || minPrice || maxPrice || rating || availability) && (
            <span className="h-2 w-2 rounded-full bg-foodie-orange" />
          )}
        </button>

        {/* Sort Drawer Trigger Button */}
        <button
          onClick={() => setIsSortDrawerOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowUpDown className="h-4 w-4 text-[#0B542F] dark:text-emerald-400" />
          <span>Sort</span>
        </button>

        {/* View Mode Dropdown */}
        <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-dark-bg text-xs">
          <Layers className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="text-[11px] focus:outline-none bg-transparent cursor-pointer font-semibold"
          >
            <option value="pagination">Pages</option>
            <option value="infinite">Scroll</option>
          </select>
        </div>

      </div>

      {/* Active Filter Badges */}
      {(category || minPrice || maxPrice || availability) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[11px] font-bold text-slate-500">Active Filters:</span>
          {category && (
            <span className="inline-flex items-center gap-1 bg-[#0B542F] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
              Category: {category}
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1 bg-[#0B542F] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
              Price: ₹{minPrice || 0} - ₹{maxPrice || 'Max'}
            </span>
          )}
          {availability && (
            <span className="inline-flex items-center gap-1 bg-[#0B542F] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
              In Stock Only
            </span>
          )}
          <button
            onClick={handleClearFilters}
            className="text-[11px] font-bold text-foodie-orange hover:underline cursor-pointer ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Catalog Grid */}
      <main className="flex-1 flex flex-col gap-6">

        {loading && sortedProducts.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white dark:bg-dark-card skeleton-shimmer" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-3">
            <Search className="h-10 w-10 text-slate-300 dark:text-slate-600 animate-bounce" />
            <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
              No products match selected filters
            </p>
            <p className="text-xs text-slate-400">
              Try adjusting your price range or category filter.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-2 rounded-2xl bg-[#0B542F] text-white px-5 py-2 text-xs font-bold hover:bg-[#43B649] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {sortedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {viewMode === 'infinite' && (
              <div ref={observerTarget} className="w-full flex justify-center py-6">
                {loading && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-64 rounded-2xl bg-white dark:bg-dark-card skeleton-shimmer" />
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
              onClick={() => {
                setPage(currentPage - 1);
                const p = Object.fromEntries(searchParams.entries());
                p.page = (currentPage - 1).toString();
                setSearchParams(p);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              Previous
            </button>

            <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400 px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => {
                setPage(currentPage + 1);
                const p = Object.fromEntries(searchParams.entries());
                p.page = (currentPage + 1).toString();
                setSearchParams(p);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}

      </main>

      {/* ----------------------------------------------------------------- */}
      {/* FILTER BOTTOM SHEET DRAWER */}
      {/* ----------------------------------------------------------------- */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-dark-card rounded-t-3xl p-5 border-t border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#0B542F] dark:text-emerald-400" />
                <span>Filter Products</span>
              </h3>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="py-4 space-y-4">
              
              {/* Category Filter */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-[#0B542F]"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Price Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min Price (₹)"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-[#0B542F]"
                  />
                  <input
                    type="number"
                    placeholder="Max Price (₹)"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-[#0B542F]"
                  />
                </div>
              </div>

              {/* Stock Filter */}
              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  In Stock Only
                </span>
                <input
                  type="checkbox"
                  checked={availability === 'true'}
                  onChange={(e) => setAvailability(e.target.checked ? 'true' : '')}
                  className="h-5 w-5 rounded border-slate-300 text-[#0B542F] focus:ring-[#0B542F] cursor-pointer"
                />
              </div>

              {/* Drawer Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-[#0B542F] hover:bg-[#43B649] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SORT BOTTOM SHEET DRAWER */}
      {/* ----------------------------------------------------------------- */}
      {isSortDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-dark-card rounded-t-3xl p-5 border-t border-slate-200 dark:border-slate-800 max-h-[70vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-[#0B542F] dark:text-emerald-400" />
                <span>Sort Products By</span>
              </h3>
              <button
                onClick={() => setIsSortDrawerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-3 space-y-1">
              {sortOptions.map((option) => {
                const isSelected = sort === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelectSort(option.value)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-foodie-green-light dark:bg-emerald-950/40 text-[#0B542F] dark:text-emerald-400'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-[#0B542F] dark:text-emerald-400" />}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

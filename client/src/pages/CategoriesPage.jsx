import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Search, ChevronRight, Utensils, Sparkles } from 'lucide-react';
import API from '../services/api.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { handleImageError } from '../utils/imageUtils.js';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/products/categories');
      const cats = data.categories || [];
      setCategories(cats);
      if (cats.length > 0) {
        handleSelectCategory(cats[0]);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = async (cat) => {
    setSelectedCategory(cat);
    try {
      setProductsLoading(true);
      const { data } = await API.get(`/products?category=${cat.slug || cat._id}&limit=12`);
      setCategoryProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching category products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-foodie-bg dark:bg-dark-bg pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">

        <Breadcrumbs paths={[{ label: 'Categories' }]} />

        {/* Categories Header & Category Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Grid className="h-6 w-6 text-[#0B542F] dark:text-emerald-400" />
              <span>Food Categories</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Explore wholesale food catalogs by category
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-[#0B542F]"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white dark:bg-dark-card skeleton-shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Left Sidebar: Categories Navigation Tabs */}
            <div className="md:col-span-1 flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategory?._id === cat._id;
                return (
                  <button
                    key={cat._id}
                    onClick={() => handleSelectCategory(cat)}
                    className={`flex items-center gap-3 p-3 rounded-2xl text-left transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B542F] text-white shadow-xs font-bold'
                        : 'bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-xl p-1.5 flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white/20' : 'bg-foodie-green-light dark:bg-emerald-950/40'
                    }`}>
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          onError={handleImageError}
                          className="h-full w-full object-contain rounded-lg"
                        />
                      ) : (
                        <Utensils className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-[#0B542F] dark:text-emerald-400'}`} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs block truncate">{cat.name}</span>
                      <span className={`text-[10px] block ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        Explore Items
                      </span>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>

            {/* Right Pane: Category Products Grid */}
            <div className="md:col-span-3 bg-white dark:bg-dark-card rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
              {selectedCategory && (
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                      {selectedCategory.name} Catalog
                    </h2>
                    <p className="text-xs text-slate-400">
                      Showing products under {selectedCategory.name}
                    </p>
                  </div>
                  <Link
                    to={`/products?category=${selectedCategory.slug || selectedCategory._id}`}
                    className="text-xs font-bold text-[#0B542F] dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>View All Catalog</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}

              {productsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-60 rounded-2xl bg-slate-50 dark:bg-slate-900 skeleton-shimmer" />
                  ))}
                </div>
              ) : categoryProducts.length === 0 ? (
                <div className="text-center py-16 text-xs text-slate-400">
                  No products found under this category right now.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

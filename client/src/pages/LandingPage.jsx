import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  Scale, 
  BadgeDollarSign,
  Award,
  Flame,
  Percent,
  ThumbsUp
} from 'lucide-react';
import API from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { CardSkeleton } from '../components/Skeleton.jsx';

export default function LandingPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [topDeals, setTopDeals] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load categories and all sections in parallel
        const [
          catRes,
          trendingRes,
          bestRes,
          newRes,
          dealsRes,
          recRes
        ] = await Promise.all([
          API.get('/products/categories'),
          API.get('/products?sort=rating&limit=4'),
          API.get('/products?sort=popular&limit=4'),
          API.get('/products?sort=newest&limit=4'),
          API.get('/products?discount=1&limit=4'),
          API.get('/products?limit=4') // general fallback/recommended
        ]);

        setCategories(catRes.data.categories || []);
        setTrendingProducts(trendingRes.data.products || []);
        setBestSellers(bestRes.data.products || []);
        setNewArrivals(newRes.data.products || []);
        setTopDeals(dealsRes.data.products || []);
        setRecommended(recRes.data.products || []);
      } catch (err) {
        console.error('Error loading landing page resources:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal)}`);
    }
  };

  // Reusable component block for the product sections
  const ProductSection = ({ title, subtitle, products, icon: Icon, viewAllUrl }) => (
    <section className="py-12 bg-white dark:bg-dark-card border-b border-slate-100 dark:border-slate-850/40 last:border-b-0 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 text-emerald-500" />}
              <span>{title}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          </div>
          <Link to={viewAllUrl} className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-350 transition-colors">
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full py-10 text-center text-xs font-semibold text-slate-450">
              No products found in this section.
            </div>
          ) : (
            products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          )}
        </div>

      </div>
    </section>
  );

  return (
    <div className="flex flex-col min-h-screen">

      {/* 1. Hero Banner with Glassmorphism */}
      <section className="relative overflow-hidden bg-linear-to-br from-emerald-50 via-slate-50 to-indigo-50/40 py-20 dark:from-emerald-950/10 dark:via-dark-bg dark:to-slate-900/10 transition-colors duration-200">
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">

          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Premium B2B Sourcing Platform</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl max-w-3xl leading-none">
            Direct Bulk Sourcing For <span className="text-emerald-600 dark:text-emerald-500">Your Business</span>
          </h1>

          <p className="mt-6 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl">
            Register as a buyer to shop bulk products, fashion, electronics, and devices at direct wholesale prices. MOQ rules apply.
          </p>

          {/* Large Hero Search */}
          <form onSubmit={handleHeroSearch} className="mt-8 flex w-full max-w-lg rounded-full border border-slate-200 bg-white p-1.5 shadow-md focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-800 dark:bg-dark-card dark:focus-within:ring-emerald-600">
            <input
              type="text"
              placeholder="Enter keywords, brand, or category..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="flex-1 px-4 py-2 text-sm focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="rounded-full bg-emerald-600 px-6 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full">
            <div className="glass-panel p-4 rounded-2xl text-center">
              <p className="text-2xl font-black text-slate-800 dark:text-white">10k+</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Active Buyers</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl text-center">
              <p className="text-2xl font-black text-slate-800 dark:text-white">500+</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Verified Sellers</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl text-center">
              <p className="text-2xl font-black text-slate-800 dark:text-white">35%</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Avg. Bulk Savings</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl text-center">
              <p className="text-2xl font-black text-slate-800 dark:text-white">24hr</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Dispatch Target</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Top Categories */}
      <section className="py-16 bg-white dark:bg-dark-card transition-colors duration-200 border-b border-slate-100 dark:border-slate-850">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">Top Categories</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Browse wholesale catalogs by business category</p>
            </div>
            <Link to="/products" className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 skeleton-shimmer"></div>
              ))
            ) : (
              categories.slice(0, 10).map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white p-3 shadow-sm hover:shadow-md transition-all duration-300 dark:border-slate-800 dark:bg-dark-bg/60 dark:hover:bg-dark-bg"
                >
                  <div className="aspect-video w-full h-24 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop'}
                      alt={cat.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="mt-3 text-[10px] font-bold text-center text-slate-700 dark:text-slate-300 group-hover:text-emerald-500 transition-colors uppercase tracking-wider truncate">
                    {cat.name}
                  </h3>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 3. B2B Wholesale Features Grid */}
      <section className="py-16 bg-slate-50/50 dark:bg-dark-bg/40 transition-colors duration-200 border-b border-slate-100 dark:border-slate-850">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xl sm:text-2xl font-extrabold">Why Source With Us?</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Built specifically for distributors, hotels, restaurants, and retail shops.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-450">
                <BadgeDollarSign className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold">Wholesale Pricing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Enforce low tier prices. The larger your order quantity, the more you save per item.</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-450">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold">Enforced MOQ</h3>
              <p className="text-xs text-slate-550 leading-relaxed">Items contain clear Minimum Order Quantity rules, optimizing wholesale cargo shipping sizes.</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-450">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold">Verified Distributors</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Shop from vetted suppliers offering complete tax invoices and customs paperwork support.</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-450">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold">Freight Shipping</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Custom shipping rates for palletized logistics, with free parcel shipping above ₹50,000.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Product Sections */}
      <ProductSection
        title="Trending Products"
        subtitle="Highly rated wholesale supplies trending in your region"
        products={trendingProducts}
        icon={TrendingUp}
        viewAllUrl="/products?sort=rating"
      />

      <ProductSection
        title="Best Sellers"
        subtitle="Highest volume reordered business essentials"
        products={bestSellers}
        icon={Award}
        viewAllUrl="/products?sort=popular"
      />

      <ProductSection
        title="New Arrivals"
        subtitle="Recently launched catalogs from verified distributors"
        products={newArrivals}
        icon={Flame}
        viewAllUrl="/products?sort=newest"
      />

      <ProductSection
        title="Top Deals"
        subtitle="Time-limited high-discount wholesale contracts"
        products={topDeals}
        icon={Percent}
        viewAllUrl="/products?discount=1"
      />

      <ProductSection
        title="Recommended For You"
        subtitle="Tailored catalog based on your industry segment"
        products={recommended}
        icon={ThumbsUp}
        viewAllUrl="/products"
      />

    </div>
  );
}

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
  ThumbsUp,
  ChevronRight
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
      navigate(`/products?search=${encodeURIComponent(searchVal)}`); // navigate to products page with search query
    }
  };

  // Reusable component block for the product sections
 const ProductSection = ({
    title,
    subtitle,
    products,
    icon: Icon,
    viewAllUrl,
  }) => (
    <section className="relative py-14 bg-linear-to-b from-slate-50/40 to-white dark:from-dark-bg dark:to-dark-card transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between">

          <div>

            <div className="flex items-center gap-3">

              {Icon && (
                <div className="flex w-11 h-11  items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Icon className="h-5 w-5" />
                </div>
              )}

              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h2>

                <p className="mt-1 text-[11px] md:text-sm text-slate-500 dark:text-slate-400">
                  {subtitle}
                </p>
              </div>

            </div>

          </div>

          <Link
            to={viewAllUrl}
            className="
            group
            hidden
            sm:flex
            items-center
            gap-2
            rounded-full
            border
            border-slate-200
            bg-white
            px-5
            py-2.5
            text-sm
            font-semibold
            text-slate-700
            shadow-sm
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-emerald-500
            hover:bg-emerald-500
            hover:text-white
            dark:border-slate-700
            dark:bg-dark-card
            dark:text-slate-300
          "
          >
            View All

            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

        </div>

        {/* Products */}
        <div
          className="
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          transition-all
          duration-300
          dark:border-slate-800
          dark:bg-dark-card
        "
        >

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">

            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))
            ) : products.length === 0 ? (

              <div className="col-span-full py-20 text-center">

                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  📦
                </div>

                <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
                  No Products Available
                </h3>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Check back later. New products will appear here.
                </p>

              </div>

            ) : (

              products.map((product) => (
                <div
                  key={product._id}
                  className="
                  transition-all
                  duration-300
                  hover:-translate-y-1
                "
                >
                  <ProductCard product={product} />
                </div>
              ))

            )}

          </div>

        </div>

        {/* Mobile View All */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            to={viewAllUrl}
            className="
            flex
            items-center
            gap-2
            rounded-full
            bg-emerald-600
            px-6
            py-3
            text-sm
            font-semibold
            text-white
            shadow-md
            transition-all
            duration-300
            hover:bg-emerald-700
          "
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
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

          {/* <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Premium B2B Sourcing Platform</span>
          </div> */}

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
          {/* <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full">
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
          </div> */}

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
                  className="group relative flex flex-col items-center rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-emerald-300 dark:border-slate-800 dark:bg-dark-card dark:hover:border-emerald-500 overflow-hidden"
                >
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-linear-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Category Image */}
                  <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-emerald-50 to-slate-100 p-2 shadow-inner dark:from-slate-800 dark:to-slate-900">
                    <img
                      src={
                        cat.image ||
                        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop"
                      }
                      alt={cat.name}
                      className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Category Name */}
                  <h3 className="relative z-10 mt-4 text-sm font-bold text-slate-800 dark:text-slate-200 text-center transition-colors group-hover:text-emerald-600">
                    {cat.name}
                  </h3>

                  {/* Shop Now */}
                  <div className="relative z-10 mt-2 flex items-center gap-1 text-xs font-medium text-slate-500 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:text-slate-400">
                    Explore
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      {/* <section className="py-16 bg-slate-50/50 dark:bg-dark-bg/40 transition-colors duration-200 border-b border-slate-100 dark:border-slate-850">
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
      </section> */}

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

import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Bell,
  User,
  Sparkles,
  TrendingUp,
  Award,
  Flame,
  ThumbsUp,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Grid,
  ArrowRight
} from 'lucide-react';
import API from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import logoImg from '../assets/logo.png';
import { handleImageError, FALLBACK_PRODUCT_IMAGE } from '../utils/imageUtils.js';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [categories, setCategories] = useState([]);
  const [topSales, setTopSales] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationsCount, setNotificationsCount] = useState(2);

  // -----------------------------------------------------------------
  // HERO ADVERTISEMENT CAROUSEL STATE & DATA (EXACTLY 3 BANNERS)
  // -----------------------------------------------------------------
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const heroBanners = [


    {
      id: 1,
      badge: 'FOOD CATALOG',
      title: 'Explore Food Categories',
      subtitle: 'Find bakery, groceries, grains, beverages and more in one place.',
      ctaText: 'View Catalog',
      link: '/categories',
      bgGradient: 'from-[#083e23] via-[#0B542F] to-[#2e7d32]',
      accentColor: '#FF8A00',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRObIh02ve38_ZIGHnN6IXFFnZBA9uNfy7_EqlDIA2Klg&s=10',
    },

    {
      id: 2,
      badge: 'SPECIAL OFFER',
      title: 'Save More on Food',
      subtitle: 'Get great deals on bakery, dairy and everyday food products.',
      ctaText: 'View Offers',
      link: '/products?discount=1',
      bgGradient: 'from-[#0B542F] via-[#0D6338] to-[#43B649]',
      accentColor: '#FF8A00',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsGHhwOwymW6LjTWS-dZ4CmXdqgUVn7n6cKjDrercUWQ&s=10',
    },

    {
      id: 3,
      badge: 'POPULAR PRODUCTS',
      title: 'Shop What Buyers Love',
      subtitle: 'Discover popular and highly ordered food products from trusted sellers.',
      ctaText: 'View Popular',
      link: '/products?sort=popular',
      bgGradient: 'from-[#D35400] via-[#FF8A00] to-[#F39C12]',
      accentColor: '#FFFFFF',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8JT57cH_9qWUPv0RwQaZI4PxmpjPD6y_9gPrv-fw_eQ&s=10',
    },
  ];

  // Auto advance slide every 4.5 seconds unless paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, heroBanners.length]);

  const handleNextSlide = (e) => {
    if (e) e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
  };

  const handlePrevSlide = (e) => {
    if (e) e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? heroBanners.length - 1 : prev - 1));
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [
          catRes,
          trendingRes,
          popularRes,
          newRes,
          dealsRes,
          recRes
        ] = await Promise.all([
          API.get('/products/categories'),
          API.get('/products?sort=rating&limit=6'),
          API.get('/products?sort=popular&limit=6'),
          API.get('/products?sort=newest&limit=6'),
          API.get('/products?discount=1&limit=6'),
          API.get('/products?limit=6')
        ]);

        setCategories(catRes.data.categories || []);
        setTrendingProducts(trendingRes.data.products || []);
        setBestSellers(popularRes.data.products || []);
        setNewArrivals(newRes.data.products || []);
        setTopSales(dealsRes.data.products || []);
        setRecommended(recRes.data.products || []);
      } catch (err) {
        console.error('Error loading home page resources:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Reusable Product Section Block
  const ProductSection = ({
    title,
    subtitle,
    products,
    icon: Icon,
    viewAllUrl,
    badgeText,
  }) => (
    <section className="py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-foodie-green-light text-[#0B542F] dark:bg-emerald-950/40 dark:text-emerald-400">
                <Icon className="h-4.5 w-4.5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100">
                  {title}
                </h2>
                {badgeText && (
                  <span className="bg-foodie-orange text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {badgeText}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-55">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <Link
            to={viewAllUrl}
            className="flex items-center gap-1 text-xs font-bold text-[#0B542F] hover:text-[#43B649] dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white dark:bg-dark-card skeleton-shimmer" />
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full py-10 text-center bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-slate-800">
              <ShoppingBag className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                No items available in this section right now.
              </p>
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
    <div className="min-h-screen bg-foodie-bg dark:bg-dark-bg pb-24">

      {/* 2. Interactive 3-Banner Home Hero Advertisement Carousel */}
      <section className="px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="group relative min-h-90 overflow-hidden rounded-[28px] shadow-xl lg:min-h-100"
          >
            {/* BACKGROUND SLIDES */}
            {heroBanners.map((banner, index) => {
              const isActive = index === currentSlide;

              return (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive
                    ? "z-10 opacity-100"
                    : "pointer-events-none z-0 opacity-0"
                    }`}
                >
                  {/* Background Image */}
                  <img
                    src={banner.image}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover transition-transform duration-7000 ease-out ${isActive ? "scale-110" : "scale-100"
                      }`}
                  />

                  {/* Dark image overlay */}
                  <div className="absolute inset-0 bg-black/35" />

                  {/* Foodie green overlay */}
                  <div className="absolute inset-0 bg-linear-to-r from-[#063B22]/95 via-[#0B542F]/75 to-transparent" />

                  {/* Bottom cinematic gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/45 to-transparent" />

                  {/* Decorative glow */}
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#43B649]/25 blur-3xl" />
                  <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-foodie-orange/20 blur-3xl" />

                  {/* CONTENT */}
                  <div className="relative z-20 flex h-full  items-center px-6 sm:min-h-90 sm:px-20">
                    <div className="max-w-xl text-white">

                      {/* Badge */}
                      <div
                        className={`mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow-lg backdrop-blur-md transition-all duration-700 ${isActive
                          ? "translate-y-0 opacity-100"
                          : "translate-y-4 opacity-0"
                          }`}
                      >
                        <span className="flex h-2 w-2 rounded-full bg-foodie-orange shadow-[0_0_10px_#FF8A00]" />

                        {banner.badge}
                      </div>

                      {/* Title */}
                      <h1
                        className={`max-w-2xl text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl ${isActive
                          ? "translate-y-0 opacity-100"
                          : "translate-y-6 opacity-0"
                          } transition-all delay-100 duration-700`}
                      >
                        {banner.title}
                      </h1>

                      {/* Subtitle */}
                      <p
                        className={`mt-4 max-w-lg text-sm leading-6 text-white/85 sm:text-base ${isActive
                          ? "translate-y-0 opacity-100"
                          : "translate-y-6 opacity-0"
                          } transition-all delay-200 duration-700`}
                      >
                        {banner.subtitle}
                      </p>

                      {/* CTA */}
                      <div
                        className={`mt-6 ${isActive
                          ? "translate-y-0 opacity-100"
                          : "translate-y-6 opacity-0"
                          } transition-all delay-300 duration-700`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(banner.link);
                          }}
                          className="group/button inline-flex items-center gap-2 rounded-2xl bg-foodie-orange px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#e87900] hover:shadow-xl active:scale-95"
                        >
                          {banner.ctaText}

                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}

            {/* PREVIOUS BUTTON */}
            <button
              type="button"
              onClick={handlePrevSlide}
              aria-label="Previous advertisement"
              className="absolute left-4 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/20 group-hover:opacity-100 sm:h-11 sm:w-11"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* NEXT BUTTON */}
            <button
              type="button"
              onClick={handleNextSlide}
              aria-label="Next advertisement"
              className="absolute right-4 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/20 group-hover:opacity-100 sm:h-11 sm:w-11"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* SLIDE CONTROLS */}
            <div className="absolute bottom-2.5 md:bottom-5 left-2.5 md:left-10 right-2.5 md:right-10 z-30 flex items-center justify-between ">

              {/* SLIDE INDICATORS */}
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 backdrop-blur-md">
                {heroBanners.map((banner, idx) => (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(idx);
                    }}
                    aria-label={`Show advertisement ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide
                      ? "w-8 bg-foodie-orange"
                      : "w-2 bg-white/60 hover:bg-white"
                      }`}
                  />
                ))}
              </div>

              {/* SLIDE NUMBER */}
              <div className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md">
                <span className="text-foodie-orange">
                  {String(currentSlide + 1).padStart(2, "0")}
                </span>

                <span className="mx-1 text-white/40">/</span>

                <span className="text-white/70">
                  {String(heroBanners.length).padStart(2, "0")}
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. Horizontal Food Categories Scroll */}
      <section className="py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Grid className="h-5 w-5 text-[#0B542F] dark:text-emerald-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100">
                Food Categories
              </h2>
            </div>
            <Link
              to="/categories"
              className="text-xs font-bold text-[#0B542F] hover:text-[#43B649] dark:text-emerald-400 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Scrollable Category Pill Cards */}
          <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none scroll-smooth">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 w-24 shrink-0 rounded-2xl bg-white dark:bg-dark-card skeleton-shimmer" />
              ))
            ) : (
              categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${encodeURIComponent(cat.slug || cat._id)}`}
                  className="group flex flex-col items-center justify-center p-3 w-24 sm:w-28 shrink-0 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-[#43B649] transition-all text-center cursor-pointer"
                >
                  <img
                    src={cat.image || FALLBACK_PRODUCT_IMAGE}
                    alt={cat.name}
                    onError={handleImageError}
                    className="aspect-square object-cover rounded-lg"
                  />
                  <span className="text-[11px] mt-2 font-bold text-slate-800 dark:text-slate-200 truncate w-full group-hover:text-[#0B542F] transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 8. Recommended For You */}
      <ProductSection
        title="Recommended For You"
        subtitle="Handpicked food products for your business"
        products={recommended}
        icon={ThumbsUp}
        viewAllUrl="/products"
      />

      {/* 5. Trending Products Section */}
      <ProductSection
        title="Trending Supplies"
        subtitle="High-demand food supplies for canteens & stores"
        products={trendingProducts}
        icon={TrendingUp}
        viewAllUrl="/products?sort=rating"
      />

      {/* 6. Best Sellers Section */}
      <ProductSection
        title="Best Sellers"
        subtitle="Frequently re-ordered wholesale food essentials"
        products={bestSellers}
        icon={Award}
        viewAllUrl="/products?sort=popular"
      />

      {/* 7. New Arrivals Section */}
      <ProductSection
        title="New Arrivals"
        subtitle="Freshly listed products from verified suppliers"
        products={newArrivals}
        icon={Sparkles}
        viewAllUrl="/products?sort=newest"
      />

      {/* 4. Top Sales Section */}
      <ProductSection
        title="Top Sales"
        subtitle="Highest discounted bulk deals and sales promotions"
        products={topSales}
        icon={Flame}
        badgeText="HOT DEALS"
        viewAllUrl="/products?discount=1"
      />



    </div>
  );
}

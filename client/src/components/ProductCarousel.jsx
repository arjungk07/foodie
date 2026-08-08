import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard.jsx';
import { CardSkeleton } from './Skeleton.jsx';

export default function ProductCarousel({ products = [], loading = false, title = "Popular Products", subtitle = "Handpicked wholesale deals for your business" }) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateScrollState = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    
    // Calculate current item index for pagination dots
    const itemWidth = clientWidth / getItemsPerPage();
    if (itemWidth > 0) {
      const idx = Math.round(scrollLeft / itemWidth);
      setActiveIndex(idx);
    }
  };

  const getItemsPerPage = () => {
    if (typeof window === 'undefined') return 4;
    const w = window.innerWidth;
    if (w < 640) return 1;
    if (w < 1024) return 3;
    return 4;
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [products, loading]);

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const scrollToIndex = (index) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const itemWidth = container.clientWidth / getItemsPerPage();
    container.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth'
    });
  };

  if (!loading && products.length === 0) {
    return null;
  }

  // Calculate dot count based on available products
  const totalDots = Math.max(1, Math.ceil(products.length / Math.max(1, getItemsPerPage())));

  return (
    <section className="relative py-8 bg-linear-to-b from-emerald-50/60 via-white to-white dark:from-emerald-950/10 dark:via-dark-bg dark:to-dark-bg border-b border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" /> Featured Collection
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          </div>

          {/* Controls - Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Previous products"
              className={`p-2 rounded-full border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-card text-slate-700 dark:text-slate-300 shadow-xs transition-all cursor-pointer ${
                !canScrollLeft ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-600 dark:hover:bg-slate-800'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Next products"
              className={`p-2 rounded-full border border-slate-200 bg-white dark:border-slate-800 dark:bg-dark-card text-slate-700 dark:text-slate-300 shadow-xs transition-all cursor-pointer ${
                !canScrollRight ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-600 dark:hover:bg-slate-800'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Carousel Scroll Area */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            tabIndex={0}
            aria-label="Popular Products Carousel"
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 scrollbar-none scrollbar-hide focus:outline-none focus:ring-1 focus:ring-emerald-500/30 rounded-xl"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-65 sm:min-w-70 lg:min-w-72.5 snap-start shrink-0">
                  <CardSkeleton />
                </div>
              ))
            ) : (
              products.map((prod) => (
                <div
                  key={prod._id}
                  className="w-[82vw] sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)] snap-start shrink-0"
                >
                  <ProductCard product={prod} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Indicator Dots */}
        {!loading && totalDots > 1 && (
          <div className="mt-4 flex justify-center items-center gap-1.5">
            {Array.from({ length: totalDots }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === idx
                    ? 'w-6 bg-emerald-600 dark:bg-emerald-500'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

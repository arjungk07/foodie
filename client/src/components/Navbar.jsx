import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, Heart, Bell, Sun, Moon, LogOut, User as UserIcon, Search, Menu, X, Shield, BarChart3, Store, History, TrendingUp } from 'lucide-react';
import { logoutUser, forceLogout } from '../redux/slices/authSlice.js';
import { fetchCart } from '../redux/slices/cartSlice.js';
import API from '../services/api.js';
import { handleImageError, FALLBACK_PRODUCT_IMAGE } from '../utils/imageUtils.js';

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Search Dropdown States
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState({ categories: [], brands: [], products: [] });
  const [trending, setTrending] = useState([]);
  const [searchHistory, setSearchHistory] = useState(JSON.parse(localStorage.getItem('searchHistory')) || []);
  const searchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);

  // Toggle Theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load Cart & Notifications on login
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      fetchNotifications();
    }
  }, [isAuthenticated, dispatch]);

  // Fetch Trending Queries & Listen for Outside Clicks
  useEffect(() => {
    fetchTrending();
    const handleClickOutside = (e) => {
      const isInsideDesktop = searchContainerRef.current && searchContainerRef.current.contains(e.target);
      const isInsideMobile = mobileSearchContainerRef.current && mobileSearchContainerRef.current.contains(e.target);
      if (!isInsideDesktop && !isInsideMobile) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions fetch
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSuggestions({ categories: [], brands: [], products: [] });
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const { data } = await API.get(`/products/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (data.success) {
          setSuggestions({
            categories: data.categories || [],
            brands: data.brands || [],
            products: data.products || []
          });
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/users/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTrending = async () => {
    try {
      const { data } = await API.get('/products/search/trending');
      if (data.success) {
        setTrending(data.trending || []);
      }
    } catch (err) {
      console.error('Error fetching trending searches:', err);
    }
  };

  // Add query to Local search history
  const addQueryToHistory = (query) => {
    const trimmed = query.trim();
    // trimmed represent the search query name 
    // search history represent the array of search queries 
    if (!trimmed) return;
    const updated = [trimmed, ...searchHistory.filter(q => q !== trimmed)].slice(0, 8);
    console.log(updated);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addQueryToHistory(searchQuery);
      setIsSearchFocused(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (type, value) => {
    // type is represent product , category and brands . value is represent id of product , category and brand name 
    setIsSearchFocused(false);
    if (type === 'product') {
      navigate(`/products/${value._id}`);
    } else if (type === 'category') {
      addQueryToHistory(value.name);
      navigate(`/products?category=${encodeURIComponent(value.slug)}`);
    } else if (type === 'brand') {
      addQueryToHistory(value);
      navigate(`/products?brand=${encodeURIComponent(value)}`);
    } else if (type === 'query') {
      setSearchQuery(value);
      addQueryToHistory(value);
      navigate(`/products?search=${encodeURIComponent(value)}`);
    }
  };

  const handleDeleteHistoryItem = (e, item) => {
    e.stopPropagation();
    const updated = searchHistory.filter(q => q !== item);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  // Highlight matching text utility
  const highlightMatch = (text, highlight) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight.trim()})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <strong key={index} className="text-emerald-600 dark:text-emerald-450 font-bold">{part}</strong>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsProfileDropdownOpen(false);
    navigate('/login');
  };

  // Listen for forced logout event
  useEffect(() => {
    const handleForceLogout = () => {
      dispatch(forceLogout());
      navigate('/login');
    };
    window.addEventListener('auth_session_expired', handleForceLogout);
    return () => window.removeEventListener('auth_session_expired', handleForceLogout);
  }, [dispatch, navigate]);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const markNotifRead = async (id) => {
    try {
      await API.put(`/users/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-dark-bg/85 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-emerald-600 dark:text-emerald-500">
            <img
              src="./src/assets/logo.jpg"
              alt="Foodie logo"
              className="h-17 w-18"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(48%) sepia(90%) saturate(600%) hue-rotate(95deg)"
              }}
            />
            <span className='dancing-script text-3xl md:text-4xl font-extrabold'>foodie</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div ref={searchContainerRef} className="hidden md:block relative flex-1 max-w-md">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-md rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-dark-card dark:border-slate-800 dark:focus:ring-emerald-600 dark:focus:bg-dark-card transition-all"
              />
              <Search className="absolute left-3.5 top-3.25 h-4 w-4 text-slate-400" />
            </form>
            {isSearchFocused && (
              <div className="absolute top-12 left-0 right-0 max-h-80 overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-dark-card/95 transition-all animate-fadeIn z-50">
                {searchQuery.trim().length === 0 ? (
                  <div className="flex flex-col gap-4">
                    {/* Search History */}
                    {searchHistory.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <History className="h-3 w-3" /> Recent Searches
                        </h4>
                        <div className="flex flex-col gap-1.5">
                          {searchHistory.map((item, index) => (
                            <div
                              key={index}
                              onClick={() => handleSuggestionClick('query', item)}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer text-slate-700 dark:text-slate-350"
                            >
                              <span>{item}</span>
                              <button
                                onClick={(e) => handleDeleteHistoryItem(e, item)}
                                className="text-slate-450 hover:text-red-500 p-0.5 cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Frequently Searched */}
                    {trending.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> Frequently Searched
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {trending.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick('query', item)}
                              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-450 text-xs transition-colors cursor-pointer"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchHistory.length === 0 && trending.length === 0 && (
                      <div className="text-center py-4 text-xs text-slate-400">
                        Type to start searching...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {/* Category suggestions */}
                    {suggestions.categories.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Categories</h4>
                        <div className="flex flex-col">
                          {suggestions.categories.map((cat) => (
                            <div
                              key={cat._id}
                              onClick={() => handleSuggestionClick('category', cat)}
                              className="px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer font-medium"
                            >
                              {highlightMatch(cat.name, searchQuery)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Brand suggestions */}
                    {suggestions.brands.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Brands</h4>
                        <div className="flex flex-col">
                          {suggestions.brands.map((brand, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSuggestionClick('brand', brand)}
                              className="px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer font-medium"
                            >
                              {highlightMatch(brand, searchQuery)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Product suggestions */}
                    {suggestions.products.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Products</h4>
                        <div className="flex flex-col gap-1">
                          {suggestions.products.map((prod) => (
                            <div
                              key={prod._id}
                              onClick={() => handleSuggestionClick('product', prod)}
                              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                            >
                              <img
                                src={prod.images?.[0]?.url || FALLBACK_PRODUCT_IMAGE}
                                alt={prod.productName}
                                loading="lazy"
                                decoding="async"
                                onError={handleImageError}
                                className="h-8 w-8 rounded-md object-contain bg-slate-50 border border-slate-200 dark:border-slate-800 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate text-slate-850 dark:text-slate-200">
                                  {highlightMatch(prod.productName, searchQuery)}
                                </p>
                                <p className="text-[10px] text-slate-450 mt-0.5">
                                  Price: <span className="text-emerald-600 font-bold">₹{prod.price}</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestions.categories.length === 0 &&
                      suggestions.brands.length === 0 &&
                      suggestions.products.length === 0 && (
                        <div className="text-center py-4 text-xs text-slate-400">
                          No matches found.
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions - Desktop */}
          <div className="hidden lg:flex items-center gap-4">

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Catalog Link */}
            <Link to="/products" className="text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400">
              Browse Products
            </Link>

            {isAuthenticated ? (
              <>
                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 relative"
                >
                  <Heart className="h-5 w-5" />
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                      {items.reduce((acc, curr) => acc + curr.quantity, 0)}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadNotifs}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-dark-card">
                      <div className="border-b border-slate-100 px-3 py-2 text-xs font-semibold dark:border-slate-850">
                        Notifications
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        {notifications.length === 0 ? (
                          <div className="px-3 py-4 text-center text-xs text-slate-500">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => markNotifRead(notif._id)}
                              className={`flex flex-col px-3 py-2 rounded-lg text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 mb-1 ${!notif.read ? 'bg-emerald-50/40 dark:bg-emerald-950/10' : ''}`}
                            >
                              <span className="font-semibold">{notif.title}</span>
                              <span className="text-slate-500 mt-0.5">{notif.message}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Selector */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full border border-slate-200 hover:border-emerald-500 dark:border-slate-850 focus:outline-none"
                  >
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.fullName} className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                        <UserIcon className="h-4 w-4" />
                      </div>
                    )}
                    <span className="text-xs font-medium pr-1 text-slate-700 dark:text-slate-300">{user.fullName.split(' ')[0]}</span>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-dark-card">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-850">
                        <p className="text-xs font-bold truncate">{user.fullName}</p>
                        <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                      </div>

                      <div className="py-1">
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Shield className="h-4 w-4 text-emerald-500" />
                            Admin Console
                          </Link>
                        )}
                        {user.role === 'seller' && (
                          <Link
                            to="/seller"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <BarChart3 className="h-4 w-4 text-emerald-500" />
                            Seller Hub
                          </Link>
                        )}
                        <Link
                          to="/my-orders"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <History className="h-4 w-4" />
                          My Orders
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <UserIcon className="h-4 w-4" />
                          My Account
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-xs font-semibold border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Bar Row (Visible only on mobile < md) */}
        <div ref={mobileSearchContainerRef} className="md:hidden relative pb-3 pt-1">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-dark-card dark:border-slate-800 dark:focus:ring-emerald-600 dark:focus:bg-dark-card transition-all shadow-xs"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          </form>

          {/* Mobile Suggestions dropdown */}
          {isSearchFocused && (
            <div className="absolute top-14 left-0 right-0 max-h-80 overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-dark-card/95 transition-all animate-fadeIn z-50">
              {searchQuery.trim().length === 0 ? (
                <div className="flex flex-col gap-4">
                  {/* Search History */}
                  {searchHistory.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <History className="h-3 w-3" /> Recent Searches
                      </h4>
                      <div className="flex flex-col gap-1.5">
                        {searchHistory.map((item, index) => (
                          <div
                            key={index}
                            onClick={() => handleSuggestionClick('query', item)}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer text-slate-700 dark:text-slate-350"
                          >
                            <span>{item}</span>
                            <button
                              onClick={(e) => handleDeleteHistoryItem(e, item)}
                              className="text-slate-450 hover:text-red-500 p-0.5 cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Frequently Searched */}
                  {trending.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Frequently Searched
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {trending.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick('query', item)}
                            className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-450 text-xs transition-colors cursor-pointer"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchHistory.length === 0 && trending.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400">
                      Type to start searching...
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Category suggestions */}
                  {suggestions.categories.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Categories</h4>
                      <div className="flex flex-col">
                        {suggestions.categories.map((cat) => (
                          <div
                            key={cat._id}
                            onClick={() => handleSuggestionClick('category', cat)}
                            className="px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer font-medium"
                          >
                            {highlightMatch(cat.name, searchQuery)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Brand suggestions */}
                  {suggestions.brands.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Brands</h4>
                      <div className="flex flex-col">
                        {suggestions.brands.map((brand, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSuggestionClick('brand', brand)}
                            className="px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer font-medium"
                          >
                            {highlightMatch(brand, searchQuery)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product suggestions */}
                  {suggestions.products.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Products</h4>
                      <div className="flex flex-col gap-1">
                        {suggestions.products.map((prod) => (
                          <div
                            key={prod._id}
                            onClick={() => handleSuggestionClick('product', prod)}
                            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                          >
                            <img
                              src={prod.images?.[0]?.url || FALLBACK_PRODUCT_IMAGE}
                              alt={prod.productName}
                              loading="lazy"
                              decoding="async"
                              onError={handleImageError}
                              className="h-8 w-8 rounded-md object-contain bg-slate-50 border border-slate-200 dark:border-slate-800 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate text-slate-850 dark:text-slate-200">
                                {highlightMatch(prod.productName, searchQuery)}
                              </p>
                              <p className="text-[10px] text-slate-450 mt-0.5">
                                Price: <span className="text-emerald-600 font-bold">₹{prod.price}</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {suggestions.categories.length === 0 &&
                    suggestions.brands.length === 0 &&
                    suggestions.products.length === 0 && (
                      <div className="text-center py-4 text-xs text-slate-400">
                        No matches found.
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          className="
      lg:hidden
      absolute
      top-full
      left-0
      w-full
      z-50
      animate-in
      slide-in-from-top-3
      fade-in
      duration-300
      origin-top
      rounded-b-3xl
      border-t
      border-slate-200
      bg-white/95
      backdrop-blur-xl
      shadow-2xl
      dark:bg-dark-bg/95
      dark:border-slate-800
    "
        >
          <div className="max-h-[calc(100vh-80px)] overflow-y-auto px-5 py-5">

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
            w-full
            rounded-full
            border
            border-slate-200
            bg-slate-50
            py-3
            pl-11
            pr-4
            text-sm
            outline-none
            transition-all
            duration-300
            focus:border-emerald-500
            focus:ring-4
            focus:ring-emerald-100
            dark:bg-dark-card
            dark:border-slate-800
            dark:focus:ring-emerald-900/30
          "
              />
            </form>

            {/* Navigation */}
            <div className="space-y-2">

              <Link
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="
            hidden lg:flex items-center
            rounded-xl
            px-4
            py-3
            text-sm
            font-medium
            transition-all
            duration-200
            hover:bg-emerald-50
            hover:text-emerald-600
            dark:hover:bg-slate-800
          "
              >
                Browse Products
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="
                flex
                items-center
                justify-between
                rounded-xl
                px-4
                py-3
                text-sm
                font-medium
                transition-all
                duration-200
                hover:bg-emerald-50
                hover:text-emerald-600
                dark:hover:bg-slate-800
              "
                  >
                    <span>Shopping Cart</span>

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      {items.reduce((acc, curr) => acc + curr.quantity, 0)}
                    </span>
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="
                flex items-center
                rounded-xl
                px-4
                py-3
                text-sm
                font-medium
                transition-all
                duration-200
                hover:bg-emerald-50
                hover:text-emerald-600
                dark:hover:bg-slate-800
              "
                  >
                    Wishlist
                  </Link>

                  <Link
                    to="/my-orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="
                flex items-center
                rounded-xl
                px-4
                py-3
                text-sm
                font-medium
                transition-all
                duration-200
                hover:bg-emerald-50
                hover:text-emerald-600
                dark:hover:bg-slate-800
              "
                  >
                    My Orders
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="
                flex items-center
                rounded-xl
                px-4
                py-3
                text-sm
                font-medium
                transition-all
                duration-200
                hover:bg-emerald-50
                hover:text-emerald-600
                dark:hover:bg-slate-800
              "
                  >
                    Account Profile
                  </Link>

                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="
                  flex items-center
                  rounded-xl
                  bg-emerald-50
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-emerald-600
                  transition
                  hover:bg-emerald-100
                  dark:bg-emerald-950/40
                "
                    >
                      Admin Console
                    </Link>
                  )}

                  {user.role === "seller" && (
                    <Link
                      to="/seller"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="
                  flex items-center
                  rounded-xl
                  bg-emerald-50
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-emerald-600
                  transition
                  hover:bg-emerald-100
                  dark:bg-emerald-950/40
                "
                    >
                      Seller Dashboard
                    </Link>
                  )}

                  <div className="my-4 border-t border-slate-200 dark:border-slate-800"></div>

                  <button
                    onClick={handleLogout}
                    className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-red-50
                py-3
                text-sm
                font-semibold
                text-red-600
                transition-all
                duration-200
                hover:bg-red-100
                active:scale-95
                dark:bg-red-950/40
              "
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="mt-4 space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="
                flex
                justify-center
                rounded-full
                border
                border-slate-300
                py-3
                text-sm
                font-semibold
                transition
                hover:bg-slate-100
                dark:border-slate-700
                dark:hover:bg-slate-800
              "
                  >
                    Log In
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="
                flex
                justify-center
                rounded-full
                bg-emerald-600
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-emerald-700
                active:scale-95
              "
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Heart, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

export default function Wishlist() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, navigate]);

  const fetchWishlist = async () => {
    try {
      const { data } = await API.get('/users/wishlist');
      setWishlistItems(data.wishlist?.products || []);
    } catch (err) {
      console.error('Error loading wishlist:', err);
      toast.error('Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

      {/* Breadcrumbs */}
      <Breadcrumbs paths={[{ label: 'Saved Wishlist' }]} />

      <div className="flex items-center justify-between mt-4 mb-6">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            <span>Saved Wholesale Catalog</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {wishlistItems.length} saved product{wishlistItems.length !== 1 ? 's' : ''} in your business wishlist
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <Link
            to="/products"
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400"
          >
            <span>Explore More Offers</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
          Loading saved products...
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center px-10 py-20 flex flex-col items-center justify-center gap-4 bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 rounded-3xl mt-4">
          <div className="h-16 w-16 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="text-sm font-bold">Your Wishlist is Empty</h2>
          <p className="text-xs text-slate-500 max-w-sm">
            Save wholesale products while browsing the catalog to review or bulk order later.
          </p>
          <Link to="/products" className="mt-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onWishlistUpdate={fetchWishlist}
            />
          ))}
        </div>
      )}

    </div>
  );
}

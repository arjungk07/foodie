import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Star, Check, Loader2 } from 'lucide-react';
import { addToCart } from '../redux/slices/cartSlice.js';
import { toast } from 'react-toastify';
import API from '../services/api.js';
import { formatINR } from '../utils/currency.js';
import { handleImageError, FALLBACK_PRODUCT_IMAGE } from '../utils/imageUtils.js';

export default function ProductCard({ product, onWishlistUpdate }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Please login to add items to cart');
      return;
    }

    try {
      setIsAdding(true);
      await dispatch(
        addToCart({ productId: product._id, quantity: product.minimumOrderQuantity })
      ).unwrap();

      setIsAdded(true);
      toast.success(`Added MOQ (${product.minimumOrderQuantity}) items to cart!`);

      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } catch (err) {
      toast.error(err || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Please login to save products');
      return;
    }
    try {
      if (isWishlisted) {
        await API.delete(`/users/wishlist/${product._id}`);
        setIsWishlisted(false);
        toast.info('Removed from wishlist');
      } else {
        await API.post('/users/wishlist', { productId: product._id });
        setIsWishlisted(true);
        toast.success('Saved to wishlist!');
      }
      if (onWishlistUpdate) onWishlistUpdate();
    } catch (err) {
      toast.error('Wishlist update failed');
    }
  };

  const hasDiscount = product.discount > 0;
  const categoryName = product.category?.name || product.category || 'General';
  const finalPrice = hasDiscount
    ? product.price - product.price * (product.discount / 100)
    : product.price;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-dark-card shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full">

      {/* Product Image & Link */}
      <Link to={`/products/${product._id}`} className="flex flex-col flex-1">

        <div className="relative h-44 w-full overflow-hidden bg-slate-50 dark:bg-slate-900/40 flex items-center justify-center p-3 border-b border-slate-100 dark:border-slate-800">
          <img
            src={product.images?.[0]?.url || FALLBACK_PRODUCT_IMAGE}
            alt={product.productName}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            className="h-full max-h-full w-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />

          {/* Discount Badge */}
          {hasDiscount && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-foodie-orange px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shadow-xs">
              {product.discount}% OFF
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className="absolute right-2 top-2 z-10 p-1.5 rounded-full bg-white/90 dark:bg-dark-card/90 shadow-xs text-slate-400 hover:text-rose-500 transition-transform hover:scale-110 cursor-pointer"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-3 flex-1 flex flex-col justify-between gap-1.5">

          <div>
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="truncate max-w-[70%]">{categoryName}</span>
              <span className="flex items-center gap-0.5 text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-1 py-0.2 rounded-xs font-black">
                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                {product.rating?.toFixed(1) || '4.5'}
              </span>
            </div>

            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 mt-1 leading-snug group-hover:text-[#0B542F] transition-colors h-8">
              {product.productName}
            </h3>
          </div>

          {/* Price & MOQ */}
          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-baseline flex-wrap gap-1">
              <span className="text-sm font-extrabold text-[#0B542F] dark:text-emerald-400">
                {formatINR(finalPrice)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-slate-400 line-through">
                  {formatINR(product.price)}
                </span>
              )}
            </div>

            <p className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              MOQ: <span className="text-[#0B542F] dark:text-emerald-400 font-bold">{product.minimumOrderQuantity} units</span>
            </p>
          </div>

        </div>

      </Link>

      {/* Button-Level Optimistic Loading Action */}
      <div className="p-3 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-[11px] font-bold transition-all cursor-pointer ${
            isAdded
              ? 'bg-[#43B649] text-white'
              : isAdding
              ? 'bg-slate-100 text-slate-400 dark:bg-slate-800'
              : 'bg-[#0B542F] hover:bg-primary-700 text-white shadow-xs'
          }`}
        >
          {isAdding ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Adding...</span>
            </>
          ) : isAdded ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Added ✓</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}

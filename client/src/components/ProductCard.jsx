import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { addToCart } from '../redux/slices/cartSlice.js';
import { toast } from 'react-toastify';
import API from '../services/api.js';
import { formatINR } from '../utils/currency.js';

export default function ProductCard({ product, onWishlistUpdate }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Please login to place wholesale orders');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity: product.minimumOrderQuantity }))
      .unwrap()
      .then(() => toast.success(`Added MOQ (${product.minimumOrderQuantity}) items to cart!`))
      .catch((err) => toast.error(err || 'Failed to add to cart'));
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Please login to save products');
      return;
    }
    try {
      await API.post('/users/wishlist', { productId: product._id });
      toast.success('Product saved to wishlist!');
      if (onWishlistUpdate) onWishlistUpdate();
    } catch (err) {
      if (err.response?.status === 400) {
        try {
          await API.delete(`/users/wishlist/${product._id}`);
          toast.info('Removed from wishlist');
          if (onWishlistUpdate) onWishlistUpdate();
        } catch (e) {
          toast.error('Wishlist action failed');
        }
      } else {
        toast.error(err.response?.data?.message || 'Wishlist action failed');
      }
    }
  };

  const hasDiscount = product.discount > 0;
  const categoryName = product.category?.name || product.category || 'General';

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 dark:border-slate-800 dark:bg-dark-card h-full">
      
      {/* Product Link wrapper */}
      <Link to={`/products/${product._id}`} className="flex flex-col flex-1">
        
        {/* Product Image Box */}
        <div className="relative h-40 w-full overflow-hidden bg-slate-50 dark:bg-slate-900/40 flex items-center justify-center p-3 border-b border-slate-100 dark:border-slate-850">
          <img
            src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
            alt={product.productName}
            className="h-full max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Discount Badge */}
          {hasDiscount && (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-rose-500 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shadow-xs">
              {product.discount}% OFF
            </span>
          )}

          {/* Wishlist Button */}
          <button 
            onClick={handleToggleWishlist}
            className="absolute right-2.5 top-2.5 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-xs shadow-xs text-slate-500 hover:text-rose-500 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:text-rose-500 transition-all hover:scale-110 duration-200 cursor-pointer"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-3 flex-1 flex flex-col justify-between gap-2">
          
          {/* Title & Brand Row */}
          <div>
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span className="truncate max-w-[70%]">{categoryName}</span>
              <span className="flex items-center gap-0.5 text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-1 py-0.2 rounded-sm font-extrabold">
                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                {product.rating?.toFixed(1) || '0.0'}
              </span>
            </div>
            
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 mt-1.5 leading-snug group-hover:text-emerald-600 transition-colors h-8">
              {product.productName}
            </h3>
            
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{product.brand}</p>
          </div>

          {/* Pricing & Order Info */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
            <div className="flex items-baseline flex-wrap gap-1">
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-500">
                {formatINR(product.wholesalePrice)}
              </span>
              {product.price > product.wholesalePrice && (
                <span className="text-[10px] text-slate-400 line-through dark:text-slate-500 ml-1">
                  {formatINR(product.price)}
                </span>
              )}
              {hasDiscount && (
                <span className="text-[9px] font-bold text-rose-500 ml-1">
                  ({product.discount}% off)
                </span>
              )}
            </div>

            {/* B2B MOQ Label */}
            <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
              MOQ: <span className="text-emerald-600 dark:text-emerald-450 font-bold">{product.minimumOrderQuantity} units</span>
            </p>
          </div>
        </div>
      </Link>

      {/* Add To Cart Action */}
      <div className="p-3 pt-0">
        <button
          onClick={handleAddToCart}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-bold text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Add to Cart</span>
        </button>
      </div>

    </div>
  );
}

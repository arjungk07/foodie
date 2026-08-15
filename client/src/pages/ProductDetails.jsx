import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, submitProductReview } from '../redux/slices/productSlice.js';
import { addToCart } from '../redux/slices/cartSlice.js';
import { toast } from 'react-toastify';
import { Star, ShieldAlert, ShoppingCart, Heart, Package, Calendar, Award } from 'lucide-react';
import ZoomImage from '../components/ZoomImage.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import { formatINR } from '../utils/currency.js';

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentProduct, relatedProducts, reviews, loading, error } = useSelector(
    (state) => state.products
  );
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  // Sync data on route parameter change
  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [id, dispatch]);

  // Set default quantity to MOQ once product loads
  useEffect(() => {
    if (currentProduct) {
      setQuantity(currentProduct.minimumOrderQuantity);
    }
  }, [currentProduct]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center animate-pulse">
        <p className="text-sm font-semibold text-slate-500">Loading product details...</p>
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-red-500">
        <p className="text-sm font-semibold">Offer not found or has been removed.</p>
        <Link to="/products" className="mt-4 inline-block text-xs font-bold underline text-slate-650">Back to Catalog</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.warning('Please login to place orders');
      return;
    }

    // Strict MOQ check
    if (quantity < currentProduct.minimumOrderQuantity) {
      toast.error(`Minimum Order Quantity for this product is ${currentProduct.minimumOrderQuantity} units.`);
      return;
    }

    if (quantity > currentProduct.stock) {
      toast.error(`Requested quantity exceeds available stock of ${currentProduct.stock} units.`);
      return;
    }

    dispatch(addToCart({ productId: currentProduct._id, quantity }))
      .unwrap()
      .then(() => toast.success(`Added ${quantity} items to your shopping cart!`))
      .catch((err) => toast.error(err || 'Add to cart failed'));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Only logged in buyers can submit reviews');
      return;
    }
    if (!reviewComment.trim()) {
      toast.warning('Please enter a review comment');
      return;
    }

    setReviewSubmitLoading(true);
    dispatch(submitProductReview({ productId: currentProduct._id, rating: reviewRating, comment: reviewComment }))
      .unwrap()
      .then(() => {
        toast.success('Review submitted successfully!');
        setReviewComment('');
      })
      .catch((err) => toast.error(err || 'Duplicate review or submission failed'))
      .finally(() => setReviewSubmitLoading(false));
  };

  return (
    <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

      {/* Breadcrumbs */}
      <Breadcrumbs
        paths={[
          { label: 'Catalog', url: '/products' },
          { label: currentProduct.category?.name || 'Category', url: `/products?category=${currentProduct.category?.slug}` },
          { label: currentProduct.productName }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-6">

        {/* Left Column - ZoomImage */}
        <div>
          <ZoomImage images={currentProduct.images} />
        </div>

        {/* Right Column - Sourcing Information */}
        <div className="flex flex-col gap-6">

          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              Brand: {currentProduct.brand} | SKU: {currentProduct.SKU}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {currentProduct.productName}
            </h1>

            {/* Reviews Count */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(currentProduct.rating) ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold">{currentProduct.rating}★</span>
              <span className="text-xs text-slate-400">({currentProduct.reviewsCount} customer reviews)</span>
            </div>
          </div>

          {/* Pricing Box with Glassmorphism */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-850 flex flex-col gap-4">

            {/* <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Price</p>
                <p className="text-2xl pt-1 font-black text-emerald-600 dark:text-emerald-500">
                  {formatINR(currentProduct.price)}
                </p>
              </div>
            </div> */}

            <div className="flex items-baseline flex-wrap gap-1">
              <span className="text-2xl md:text-3xl pt-1 font-black text-emerald-600 dark:text-emerald-500">
                {formatINR(
                  currentProduct.discount
                    ? Math.round(
                      currentProduct.price -
                      (currentProduct.price * currentProduct.discount) / 100
                    )
                    : currentProduct.price
                )}
              </span>

              {currentProduct.discount > 0 && (
                <>
                  <span className="text-sm text-slate-400 line-through dark:text-slate-500 ml-1">
                    {formatINR(currentProduct.price)}
                  </span>

                  <span className="text-sm font-bold text-rose-500 ml-1">
                    ({currentProduct.discount}% off)
                  </span>
                </>
              )}
            </div>

            {/* MOQ and Inventory Status */}
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center bg-emerald-50 px-3.5 py-2.5 rounded-xl text-emerald-850 dark:bg-emerald-950/20 dark:text-emerald-350">
                <span className="font-bold flex items-center gap-1.5">
                  <Package className="h-4 w-4" />
                  Minimum Order Qty (MOQ):
                </span>
                <span className="font-extrabold">{currentProduct.minimumOrderQuantity} units</span>
              </div>

              <div className="flex justify-between items-center px-3.5 py-2">
                <span className="text-slate-500">Platform Fees:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatINR(currentProduct.platformFee || 0)}
                </span>
              </div>

              <div className="flex justify-between items-center px-3.5 py-2">
                <span className="text-slate-500">Stock Availability:</span>
                <span className={`font-semibold ${currentProduct.stock > 15 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {currentProduct.stock > 0 ? `${currentProduct.stock} units in stock` : 'Out of Stock'}
                </span>
              </div>
            </div>



          </div>

          {/* Add to Cart Actions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">

              {/* Quantity input with MOQ checks */}
              <div className="flex flex-col gap-1.5 w-32">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity</label>
                <input
                  type="number"
                  min={currentProduct.minimumOrderQuantity}
                  max={currentProduct.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 dark:bg-dark-bg dark:border-slate-800 text-sm font-bold"
                />
              </div>

              {/* Action Button */}
              <div className="flex-1 flex flex-col justify-end pt-5">
                <button
                  onClick={handleAddToCart}
                  disabled={currentProduct.stock === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="h-4.5 w-4.5" />
                  <span>Add to cart  ({quantity} units)</span>
                </button>
              </div>

            </div>

            {quantity < currentProduct.minimumOrderQuantity && (
              <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                Selected quantity must be at least the MOQ of {currentProduct.minimumOrderQuantity} units.
              </p>
            )}
          </div>

          {/* Descriptions & Specs */}
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider mb-2">Product Description</h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{currentProduct.productDescription}</p>
            </div>

            {currentProduct.specifications?.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">Bulk Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
                  {currentProduct.specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between border-b border-slate-100/50 pb-1.5 text-xs dark:border-slate-850/50">
                      <span className="text-slate-400">{spec.key}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-350">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-10 border-t border-slate-200/80 dark:border-slate-850">
          <h2 className="text-lg font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Review Section */}
      <section className="mt-20 pt-10 border-t border-slate-200/80 dark:border-slate-850 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Reviews Left Summary Column */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h2 className="text-lg font-bold">Customer Reviews</h2>

          <div className="flex items-center gap-4 bg-slate-50 dark:bg-dark-card p-5 rounded-2xl border border-slate-200/60 dark:border-slate-850">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-slate-800 dark:text-white">{currentProduct.rating}</p>
              <p className="text-[10px] text-slate-400 mt-1">out of 5★</p>
            </div>
            <div className="flex-1">
              <div className="flex text-amber-400 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4.5 w-4.5 ${i < Math.floor(currentProduct.rating) ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 font-semibold">{currentProduct.reviewsCount} verified purchase comments</p>
            </div>
          </div>

          {/* Review form */}
          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3 mt-2">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Write a Review</h3>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewRating(num)}
                      className="p-1 text-amber-400 focus:outline-none"
                    >
                      <Star className={`h-4.5 w-4.5 ${num <= reviewRating ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Share your sourcing experience, delivery details, or item quality..."
                rows="3"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-slate-50/50 dark:bg-dark-card dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <button
                type="submit"
                disabled={reviewSubmitLoading}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
              >
                {reviewSubmitLoading ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-400 mt-2 bg-slate-50 dark:bg-dark-card p-3 rounded-lg text-center">
              Please <Link to="/login" className="font-semibold text-emerald-650 underline">login</Link> to write a customer review.
            </p>
          )}

        </div>

        {/* Reviews list Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Comment Thread</h3>

          {reviews.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 bg-slate-50 dark:bg-dark-card rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              No reviews written for this product yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-850 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-xs font-bold text-emerald-800 dark:text-emerald-400">
                        {rev.userId?.fullName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold">{rev.userId?.fullName}</p>
                        <p className="text-[9px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 mt-2.5">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}

        </div>

      </section>

    </div>
  );
}

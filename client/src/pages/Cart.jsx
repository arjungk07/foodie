import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartQty, removeFromCart, validateCoupon, resetCoupon, updateItemQuantityOptimistic } from '../redux/slices/cartSlice.js';
import { Trash2, ShoppingBag, ArrowRight, Info, AlertTriangle, Gift } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import { formatINR } from '../utils/currency.js';

export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, loading, activeCoupon, couponError } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [couponCode, setCouponCode] = useState('');
  const debounceTimers = useRef({});

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const handleQtyChange = (productId, newQty, stock, moq) => {
    const minQty = moq || 1;

    if (newQty < minQty) {
      toast.error(`Cannot decrease quantity below ${minQty} units.`);
      return;
    }
    if (newQty > stock) {
      toast.error(`Cannot exceed available stock of ${stock} units.`);
      return;
    }

    // 1. Immediately update UI via Redux optimistic update
    dispatch(updateItemQuantityOptimistic({ productId, quantity: newQty }));

    // 2. Debounce backend API request to handle rapid user clicks cleanly
    if (debounceTimers.current[productId]) {
      clearTimeout(debounceTimers.current[productId]);
    }

    debounceTimers.current[productId] = setTimeout(() => {
      dispatch(updateCartQty({ productId, quantity: newQty }))
        .unwrap()
        .catch((err) => {
          toast.error(err || 'Failed to update quantity');
          dispatch(fetchCart());
        });
      delete debounceTimers.current[productId];
    }, 350);
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId))
      .unwrap()
      .then(() => toast.info('Item removed from cart'))
      .catch(() => toast.error('Remove failed'));
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    dispatch(validateCoupon(couponCode))
      .unwrap()
      .then((coupon) => {
        toast.success(`Coupon applied! ${coupon.discountType === 'percentage' ? coupon.discountValue + '% Off' : '₹' + coupon.discountValue.toLocaleString('en-IN') + ' Off'}`);
      })
      .catch((err) => {
        toast.error(err || 'Invalid coupon code');
      });
  };

  // Calculations
  let subTotal = 0;
  let hasMoqViolations = false;

  const processedItems = items.map((item) => {
    const p = item.productId;
    if (!p) return null;

    const isWholesaleActive = item.quantity >= p.minimumOrderQuantity;
    if (!isWholesaleActive) {
      hasMoqViolations = true;
    }

    let unitPrice = p.price;
    if (p.discount > 0) {
      unitPrice = Math.round(p.price - (p.price * (p.discount / 100)));
    }
    const itemTotal = unitPrice * item.quantity;
    subTotal += itemTotal;

    return {
      ...item,
      unitPrice,
      itemTotal
    };
  }).filter(Boolean);

  let discountAmount = 0;
  if (activeCoupon && subTotal >= activeCoupon.minPurchase) {
    if (activeCoupon.discountType === 'percentage') {
      discountAmount = subTotal * (activeCoupon.discountValue / 100);
    } else {
      discountAmount = activeCoupon.discountValue;
    }
  }

  const shippingCharges = subTotal > 500 || subTotal === 0 ? 0 : 50; // Free shipping above ₹500
  const finalTotal = Math.max(0, subTotal - discountAmount + shippingCharges);

  const handleCheckoutClick = () => {
    if (hasMoqViolations) {
      toast.error('Please adjust quantities. All products must satisfy MOQ to checkout.');
      return;
    }
    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center flex flex-col items-center justify-center gap-4">
        <ShoppingBag className="h-12 w-12 text-slate-300 dark:text-slate-700 animate-bounce" />
        <h2 className="text-lg font-bold">Your Sourcing Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-xs">Please log in to load your cart and start placing orders.</p>
        <Link to="/login" className="mt-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">
          Sign In / Register
        </Link>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-sm font-semibold text-slate-500">Syncing sourcing cart...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

      {/* Breadcrumbs */}
      <Breadcrumbs paths={[{ label: 'Shopping Cart' }]} />

      <h1 className="text-2xl font-black mt-4">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center px-10 py-20 flex flex-col items-center justify-center gap-4 bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 rounded-3xl mt-6">
          <ShoppingBag className="h-12 w-12 text-slate-300 dark:text-slate-700" />
          <h2 className="text-sm font-bold">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500">Go back to the catalog to choose  products.</p>
          <Link to="/products" className="mt-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">

          {/* Left Column - Items List */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {hasMoqViolations && (
              <div className="flex gap-2.5 rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-800 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-300">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-bold">MOQ Violation Warning</p>
                  <p className="mt-0.5 leading-relaxed">
                    Some items in your cart do not satisfy the Minimum Order Quantity (MOQ). You must increase their quantities to checkout.
                  </p>
                </div>
              </div>
            )}

            {processedItems.map((item) => {
              const p = item.productId;
              return (
                <div
                  key={item._id}
                  className="flex gap-4 p-4 bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    <img src={p.images?.[0]?.url} alt={p.productName} className="h-full w-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{p.brand}</span>
                        <Link to={`/products/${p._id}`} className="text-xs font-bold hover:text-emerald-500 block leading-tight mt-0.5">
                          {p.productName}
                        </Link>
                      </div>

                      {/* MOQ check tags */}
                      {/* <div className="mt-2">
                        {item.isWholesaleActive ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450 uppercase">
                            Wholesale Pricing Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-55/70 px-2 py-0.5 text-[9px] font-bold text-red-800 dark:bg-red-950/15 dark:text-red-400">
                            <Info className="h-3 w-3" />
                            Below MOQ ({p.minimumOrderQuantity})
                          </span>
                        )}
                      </div> */}
                    </div>

                    {/* Quantity Selector & Price */}
                    <div className="flex items-center sm:items-end justify-between sm:flex-col sm:text-right gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatINR(item.itemTotal)}</p>
                        {/* <p className="text-[10px] text-slate-450">{formatINR(item.unitPrice)} each</p> */}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Minus */}
                        <button
                          onClick={() => handleQtyChange(p._id, item.quantity - 1, p.stock, p.minimumOrderQuantity || 1)}
                          disabled={item.quantity <= (p.minimumOrderQuantity || 1)}
                          className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-xs font-bold hover:bg-slate-50 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                        {/* Plus */}
                        <button
                          onClick={() => handleQtyChange(p._id, item.quantity + 1, p.stock, p.minimumOrderQuantity || 1)}
                          disabled={item.quantity >= p.stock}
                          className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-xs font-bold hover:bg-slate-50 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          +
                        </button>

                        {/* Remove */}
                        <button
                          onClick={() => handleRemove(p._id)}
                          className="ml-2 p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}

          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-850 sticky top-20 flex flex-col gap-5">

              <h2 className="text-sm font-bold pb-2 border-b border-slate-100 dark:border-slate-800">
                Sourcing summary
              </h2>

              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Cart Subtotal:</span>
                  <span className="font-semibold text-slate-850 dark:text-white">{formatINR(subTotal)}</span>
                </div>

                {activeCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Gift className="h-3.5 w-3.5" />
                      Promo Discount ({activeCoupon.code}):
                    </span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500">
                  <span>Freight Shipping:</span>
                  <span className="font-semibold text-slate-850 dark:text-white">
                    {shippingCharges === 0 ? 'FREE' : formatINR(shippingCharges)}
                  </span>
                </div>

                {shippingCharges > 0 && (
                  <p className="text-[10px] text-slate-400 italic">
                    Add {formatINR(500 - subTotal)} more to unlock free B2B shipping!
                  </p>
                )}

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold">Total Amount:</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-500">{formatINR(finalTotal)}</span>
                </div>
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. WELCOME50)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 dark:bg-emerald-650 cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {activeCoupon && (
                <button
                  onClick={() => {
                    dispatch(resetCoupon());
                    setCouponCode('');
                  }}
                  className="text-[10px] text-red-500 font-semibold text-left -mt-2 hover:underline cursor-pointer"
                >
                  Remove active coupon
                </button>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                disabled={hasMoqViolations}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}

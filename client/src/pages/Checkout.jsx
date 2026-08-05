import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../redux/slices/cartSlice.js';
import { toast } from 'react-toastify';
import { ShieldCheck, MapPin, CreditCard, PlusCircle, CircleDollarSign, IndianRupee } from 'lucide-react';
import API from '../services/api.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import { formatINR } from '../utils/currency.js';

// Dynamically load Razorpay checkout script
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, activeCoupon } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '', addressLine: '', city: '', state: '', postalCode: '', country: 'India', mobile: ''
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'Razorpay'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchCart());
    loadAddresses();
    // Preload Razorpay script in background
    loadRazorpayScript();
  }, [isAuthenticated, navigate, dispatch]);

  const loadAddresses = async () => {
    try {
      const { data } = await API.get('/users/addresses');
      setAddresses(data.addresses || []);
      const defaultAddr = data.addresses.find(a => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
      } else if (data.addresses.length > 0) {
        setSelectedAddressId(data.addresses[0]._id);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { fullName, addressLine, city, state, postalCode, mobile } = newAddress;
    if (!fullName || !addressLine || !city || !state || !postalCode || !mobile) {
      toast.warning('Please complete all address fields');
      return;
    }
    try {
      const { data } = await API.post('/users/addresses', newAddress);
      toast.success('Address added successfully!');
      setAddresses(prev => [...prev, data.address]);
      setSelectedAddressId(data.address._id);
      setShowNewAddressForm(false);
      setNewAddress({ fullName: '', addressLine: '', city: '', state: '', postalCode: '', country: 'India', mobile: '' });
    } catch (err) {
      toast.error('Failed to add address');
    }
  };

  // ── Price Calculations ──────────────────────────────────────────────────────
  let subTotal = 0;
  items.forEach((item) => {
    const p = item.productId;
    if (!p) return;
    let price = p.price;
    if (p.discount > 0) price = price - price * (p.discount / 100);
    subTotal += price * item.quantity;
  });

  let discountAmount = 0;
  if (activeCoupon && subTotal >= activeCoupon.minPurchase) {
    discountAmount =
      activeCoupon.discountType === 'percentage'
        ? subTotal * (activeCoupon.discountValue / 100)
        : activeCoupon.discountValue;
  }

  const shippingCharges = subTotal > 500 || subTotal === 0 ? 0 : 50;
  const finalTotal = Math.max(0, subTotal - discountAmount + shippingCharges);

  // ── Place Order ─────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    setLoading(true);
    try {
      const selectedAddr = addresses.find(a => a._id === selectedAddressId);

      const orderPayload = {
        items: items.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: selectedAddr.fullName,
          addressLine: selectedAddr.addressLine,
          city: selectedAddr.city,
          state: selectedAddr.state,
          postalCode: selectedAddr.postalCode,
          country: selectedAddr.country,
          mobile: selectedAddr.mobile,
        },
        paymentMethod,
        couponCode: activeCoupon ? activeCoupon.code : null,
      };

      // Step 1: Create order on server
      const { data } = await API.post('/orders', orderPayload);
      const orderId = data.order._id;

      // ── COD Flow ─────────────────────────────────────────────────────────
      if (paymentMethod === 'COD') {
        await API.post(`/orders/${orderId}/pay`, { paymentId: 'COD', status: 'Pending' });
        toast.success('Order placed successfully (Cash on Delivery)!');
        setLoading(false);
        navigate(`/order-success?orderId=${orderId}`);
        return;
      }

      // ── Razorpay Flow ─────────────────────────────────────────────────────
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load Razorpay. Check your internet connection.');
        setLoading(false);
        return;
      }

      const { razorpayOrderId, razorpayKeyId, amount, currency } = data;

      const options = {
        key: razorpayKeyId,
        amount,            // in paise
        currency,
        name: 'Foodie',
        description: `Order #${data.order.invoiceNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: user?.fullName || selectedAddr.fullName,
          email: user?.email || '',
          contact: selectedAddr.mobile,
        },
        theme: { color: '#10b981' },

        handler: async (response) => {
          // Step 2: Verify signature on server
          try {
            await API.post(`/orders/${orderId}/verify-payment`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Payment successful! Order confirmed.');
            navigate(`/order-success?orderId=${orderId}`);
          } catch (verifyErr) {
            toast.error(verifyErr.response?.data?.message || 'Payment verification failed');
            navigate(`/order-success?orderId=${orderId}`);
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            toast.warning('Payment cancelled. Your order is saved but unpaid.');
            setLoading(false);
            navigate(`/order-success?orderId=${orderId}`);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  // ── Empty cart guard ────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-sm font-semibold">Your checkout cart is empty</h2>
        <Link to="/products" className="mt-4 inline-block text-xs font-bold underline text-slate-650">
          Browse catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

      <Breadcrumbs paths={[{ label: 'Cart', url: '/cart' }, { label: 'Checkout' }]} />

      <h1 className="text-2xl font-black mt-4 flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-emerald-500" />
        <span>Secure Checkout</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">

        {/* Left Column - Shipping & Payment */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* 1. Shipping Address */}
          <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-6 rounded-2xl shadow-sm transition-colors">
            <h2 className="text-sm font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <span>Shipping Destination</span>
            </h2>

            {addresses.length === 0 ? (
              <p className="text-xs text-slate-400 mb-2">No saved addresses. Please enter a shipping address below.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAddressId === addr._id
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-slate-200 hover:bg-slate-50/40 dark:border-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <div className="text-xs">
                      <p className="font-bold">{addr.fullName}</p>
                      <p className="text-slate-500 mt-1">{addr.addressLine}</p>
                      <p className="text-slate-500">{addr.city}, {addr.state} {addr.postalCode}</p>
                      <p className="text-slate-500 mt-1">Ph: {addr.mobile}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {!showNewAddressForm ? (
              <button
                type="button"
                onClick={() => setShowNewAddressForm(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                Add New Address
              </button>
            ) : (
              <form onSubmit={handleAddAddress} className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">New Address Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" required placeholder="Receiver Name"
                    value={newAddress.fullName} onChange={(e) => setNewAddress(p => ({ ...p, fullName: e.target.value }))}
                    className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none" />
                  <input type="tel" required placeholder="Receiver Mobile"
                    value={newAddress.mobile} onChange={(e) => setNewAddress(p => ({ ...p, mobile: e.target.value }))}
                    className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none" />
                </div>

                <input type="text" required placeholder="Street Address, Unit / Suite"
                  value={newAddress.addressLine} onChange={(e) => setNewAddress(p => ({ ...p, addressLine: e.target.value }))}
                  className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none" />

                <div className="grid grid-cols-3 gap-3">
                  <input type="text" required placeholder="City"
                    value={newAddress.city} onChange={(e) => setNewAddress(p => ({ ...p, city: e.target.value }))}
                    className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none" />
                  <input type="text" required placeholder="State"
                    value={newAddress.state} onChange={(e) => setNewAddress(p => ({ ...p, state: e.target.value }))}
                    className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none" />
                  <input type="text" required placeholder="Postal Code"
                    value={newAddress.postalCode} onChange={(e) => setNewAddress(p => ({ ...p, postalCode: e.target.value }))}
                    className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none" />
                </div>

                <div className="flex gap-2 justify-end mt-2">
                  <button type="button" onClick={() => setShowNewAddressForm(false)}
                    className="py-1.5 px-4 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:border-slate-850">
                    Cancel
                  </button>
                  <button type="submit"
                    className="py-1.5 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700">
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 2. Payment Selector */}
          <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-6 rounded-2xl shadow-sm transition-colors">
            <h2 className="text-sm font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <CreditCard className="h-4 w-4 text-emerald-500" />
              <span>Payment Options</span>
            </h2>

            <div className="flex flex-col gap-3">

              {/* Cash On Delivery */}
              <label className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'COD'
                  ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment" checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-emerald-600 focus:ring-emerald-500 h-4 w-4" />
                  <div className="text-xs">
                    <p className="font-bold flex items-center gap-1">
                      <CircleDollarSign className="h-4 w-4 text-emerald-500" />
                      Cash on Delivery (COD)
                    </p>
                    <p className="text-slate-500 mt-0.5">Pay with corporate check or cash upon dispatch arrival.</p>
                  </div>
                </div>
              </label>

              {/* Razorpay */}
              <label className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'Razorpay'
                  ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment" checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="text-emerald-600 focus:ring-emerald-500 h-4 w-4" />
                  <div className="text-xs">
                    <p className="font-bold flex items-center gap-1">
                      <IndianRupee className="h-4 w-4 text-emerald-500" />
                      Pay Online via Razorpay
                    </p>
                    <p className="text-slate-500 mt-0.5">UPI, Net Banking, Credit / Debit Card — powered by Razorpay.</p>
                  </div>
                </div>

                {paymentMethod === 'Razorpay' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>You will be redirected to the Razorpay secure payment gateway after clicking <strong>Submit Order</strong>.</span>
                  </div>
                )}
              </label>

            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-850 sticky top-20 flex flex-col gap-5">

            <h2 className="text-sm font-bold pb-2 border-b border-slate-100 dark:border-slate-800">
              Order Sourcing List
            </h2>

            <div className="flex flex-col gap-3 max-h-40 overflow-y-auto pr-1">
              {items.map((item) => {
                const p = item.productId;
                if (!p) return null;
                let unitPrice = p.price;
                if (p.discount > 0) unitPrice = p.price - (p.price * (p.discount / 100));
                return (
                  <div key={item._id} className="flex justify-between items-start text-xs border-b border-slate-50 dark:border-slate-900 pb-2">
                    <div className="max-w-[70%]">
                      <p className="font-bold truncate">{p.productName}</p>
                      <p className="text-[10px] text-slate-400">Qty: {item.quantity} × {formatINR(unitPrice)}</p>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatINR(unitPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-2.5 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>{formatINR(subTotal)}</span>
              </div>
              {activeCoupon && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount:</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Freight Shipping:</span>
                <span>{shippingCharges === 0 ? 'FREE' : formatINR(shippingCharges)}</span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold">Total Payable:</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-500">{formatINR(finalTotal)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || items.length === 0}
              className="w-full rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-40 transition-colors mt-2"
            >
              {loading
                ? 'Processing transaction...'
                : `Submit Order (${formatINR(finalTotal)})`}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

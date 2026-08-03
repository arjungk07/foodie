import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, ShieldCheck, MapPin, AlertCircle, RefreshCw,Check,
  Calendar, CreditCard, CheckCircle2, Clock, Truck,
  ChevronRight, ChevronUp, Lock, Send
} from 'lucide-react';
import API from '../services/api.js';
import { toast } from 'react-toastify';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [otpInputs, setOtpInputs] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  const [timers, setTimers] = useState({});

  const formatPrice = (num) => '₹' + Number(num).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await API.get('/orders/my-orders');
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Failed to load orders.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Set up polling for live order updates
  useEffect(() => {
    const hasActiveOrders = orders.some(
      (o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
    );
    if (!hasActiveOrders) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await API.get('/orders/my-orders');
        if (data.success) {
          // Compare order statuses to trigger toast alerts if changed
          setOrders((prevOrders) => {
            const statusMap = new Map(prevOrders.map(o => [o._id, o.orderStatus]));
            data.orders.forEach((newOrder) => {
              const oldStatus = statusMap.get(newOrder._id);
              if (oldStatus && oldStatus !== newOrder.orderStatus) {
                toast.info(`Order ${newOrder.invoiceNumber || newOrder._id.slice(-8)} updated: ${newOrder.orderStatus}`, {
                  position: 'bottom-right'
                });
              }
            });
            return data.orders || [];
          });
        }
      } catch (err) {
        console.error('Live status polling error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orders.length, orders.map(o => o.orderStatus).join(',')]);

  // Timers for OTP Expirations
  useEffect(() => {
    const runTimers = () => {
      const newTimers = {};
      orders.forEach((order) => {
        if (
          order.orderStatus === 'Out For Delivery' &&
          !order.otpVerified &&
          order.otpExpiry
        ) {
          const expiryTime = new Date(order.otpExpiry).getTime();
          const now = new Date().getTime();
          const diff = expiryTime - now;

          if (diff > 0) {
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            newTimers[order._id] = `${minutes}m ${seconds}s`;
          } else {
            newTimers[order._id] = 'Expired';
          }
        }
      });
      setTimers(newTimers);
    };

    runTimers();
    const timerInterval = setInterval(runTimers, 1000);
    return () => clearInterval(timerInterval);
  }, [orders]);

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleOtpChange = (orderId, val) => {
    // Only numeric, max length 6
    const clean = val.replace(/\D/g, '').substring(0, 6);
    setOtpInputs(prev => ({ ...prev, [orderId]: clean }));
  };

  const handleVerifyOtp = async (orderId) => {
    const otp = otpInputs[orderId];
    if (!otp || otp.length !== 6) {
      toast.warning('Please enter a valid 6-digit OTP.');
      return;
    }

    setVerifyingId(orderId);
    try {
      const { data } = await API.post(`/orders/${orderId}/verify-otp`, { otp });
      if (data.success) {
        toast.success('Delivery Verified Successfully! Order Delivered.');
        fetchOrders(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP Verification Failed.');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleRegenerateOtp = async (orderId) => {
    try {
      const { data } = await API.post(`/orders/${orderId}/generate-otp`);
      if (data.success) {
        toast.success('A new OTP has been generated and sent.');
        fetchOrders(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to regenerate OTP.');
    }
  };

  const getTimelineSteps = (order) => {
    const baseSteps = [
      'Order Placed',
      'Order Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out For Delivery',
      'Delivered'
    ];

    return baseSteps.map((label) => {
      const checkpoint = order.trackingTimeline?.find(t => t.status === label);
      return {
        label,
        completed: !!checkpoint,
        timestamp: checkpoint ? new Date(checkpoint.timestamp) : null
      };
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-start border-b border-slate-50 dark:border-slate-800 pb-4">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="h-16 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                  <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl w-full px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">My Orders</h1>
          <p className="text-xs text-slate-500 mt-1">Track status and verify package deliveries.</p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center">
            <Package className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No Orders Found</h3>
            <p className="text-xs text-slate-400 mt-1">You haven't placed any wholesale orders yet.</p>
          </div>
          <Link
            to="/products"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20"
          >
            Start Sourcing Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const timeline = getTimelineSteps(order);
            const isDelivered = order.orderStatus === 'Delivered';
            const isCancelled = order.orderStatus === 'Cancelled';
            const isOutForDelivery = order.orderStatus === 'Out For Delivery';
            const otpTimer = timers[order._id];
            const isOtpExpired = otpTimer === 'Expired';
            const showOtpInterface = isOutForDelivery && !order.otpVerified;

            // Generate Estimated Delivery (Order Placed date + 3 days)
            const estDate = new Date(order.createdAt);
            estDate.setDate(estDate.getDate() + 3);
            const formattedEstDate = estDate.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            });

            return (
              <div
                key={order._id}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Order Top Bar Info */}
                <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between text-xs text-slate-500">
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Order ID</span>
                      <span className="font-mono text-slate-700 dark:text-slate-350 font-bold">{order.invoiceNumber || order._id.slice(-8)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Ordered On</span>
                      <span className="text-slate-700 dark:text-slate-350 font-bold">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Payment Status</span>
                      <span className={`inline-flex items-center gap-1 font-bold ${order.paymentStatus === 'Paid'
                          ? 'text-emerald-600 dark:text-emerald-450'
                          : 'text-amber-600 dark:text-amber-450'
                        }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Price</span>
                      <span className="text-slate-800 dark:text-white font-black">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${isDelivered
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400'
                        : isCancelled
                          ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400'
                          : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400'
                      }`}>
                      {order.orderStatus}
                    </span>
                    <button
                      onClick={() => toggleExpand(order._id)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {expandedOrders[order._id] ? <ChevronUp className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Main Order Cards (Product Details) */}
                <div className="p-5 space-y-4">
                  {order.items?.map((item, idx) => {
                    const product = item.productId || {};
                    const productImg = product.images?.[0]?.url || 'https://via.placeholder.com/100?text=Foodie';

                    return (
                      <div key={item._id || idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 last:border-b-0 last:pb-0 dark:border-slate-800">
                        <div className="flex gap-4 items-center">
                          <img
                            src={productImg}
                            alt={item.productName}
                            className="h-16 w-16 object-cover rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-snug">{item.productName}</h4>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                              <span>SKU: <strong className="font-semibold text-slate-600 dark:text-slate-350">{product.SKU || 'N/A'}</strong></span>
                              <span>•</span>
                              <span>Seller: <strong className="font-semibold text-slate-650 dark:text-slate-350">{product.sellerId?.fullName || 'Foodie Direct'}</strong></span>
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-400">
                              Quantity: <strong className="font-semibold text-slate-700 dark:text-slate-300">{item.quantity}</strong> · Price: <strong className="font-semibold text-slate-700 dark:text-slate-300">{formatPrice(item.price)}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="text-right sm:text-left self-end sm:self-center">
                          <span className="block text-[10px] text-slate-400">Estimated Delivery</span>
                          <span className="text-xs font-bold text-slate-750 dark:text-slate-300 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                            {isDelivered
                              ? `Delivered on ${order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('en-IN') : formattedEstDate}`
                              : formattedEstDate
                            }
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* OTP Verification Dashboard for Customers */}
                  {showOtpInterface && (
                    <div className="mt-4 p-5 rounded-2xl border border-emerald-100 bg-emerald-50/20 dark:border-emerald-950/20 dark:bg-emerald-950/5 flex flex-col md:flex-row gap-5 items-center justify-between">
                      <div className="flex gap-3.5 items-start">
                        <div className="h-9 w-9 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 dark:bg-emerald-950/60 dark:text-emerald-400">
                          <Lock className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white">OTP Verification Code Required</h4>
                          <p className="text-[11px] text-slate-400 mt-1">Please enter the otp for confirmation.</p>

                          {/* Plain text OTP only visible to this logged-in customer */}
                          {order.plainOtp && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-slate-500 uppercase">Your OTP:</span>
                              <span className="font-mono text-sm font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded tracking-widest dark:bg-emerald-950/40 dark:border-emerald-900/50">{order.plainOtp}</span>
                              <span className="text-[10px] text-slate-405 font-medium flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {isOtpExpired ? (
                                  <span className="text-red-500 font-bold">Expired</span>
                                ) : (
                                  <span>Expires in <strong className="text-slate-700 dark:text-slate-350">{otpTimer}</strong></span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* OTP Submission form */}
                      <div className="flex gap-2 w-full md:w-auto">
                        <input
                          type="text"
                          placeholder="6-digit OTP"
                          value={otpInputs[order._id] || ''}
                          onChange={(e) => handleOtpChange(order._id, e.target.value)}
                          disabled={verifyingId === order._id || isOtpExpired}
                          className="w-full md:w-32 text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
                        />
                        {isOtpExpired ? (
                          <button
                            onClick={() => handleRegenerateOtp(order._id)}
                            className="px-4 py-2 rounded-xl bg-slate-650 hover:bg-slate-700 text-white text-xs font-bold transition-colors whitespace-nowrap"
                          >
                            Resend OTP
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyOtp(order._id)}
                            disabled={verifyingId === order._id || !otpInputs[order._id] || otpInputs[order._id].length !== 6}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex items-center gap-1.5"
                          >
                            {verifyingId === order._id ? 'Verifying…' : <>Verify <Send className="h-3 w-3" /></>}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* If order OTP is verified successfully */}
                  {order.otpVerified && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Delivery Completed Successfully via OTP Verification!
                    </div>
                  )}

                  {/* Timeline & Details Drawer */}
                  {expandedOrders[order._id] && (
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
                      {/* Delivery Address & Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs text-slate-600 dark:text-slate-400">
                        <div className="bg-slate-50 dark:bg-slate-800/10 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                          <h5 className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5 mb-2">
                            <MapPin className="h-4 w-4 text-emerald-500" />
                            Shipping Destination
                          </h5>
                          <p className="font-semibold text-slate-850 dark:text-slate-300">{order.shippingAddress.fullName}</p>
                          <p className="mt-0.5">{order.shippingAddress.addressLine}, {order.shippingAddress.city}</p>
                          <p>{order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                          <p className="mt-1 font-medium text-slate-500">Contact: {order.shippingAddress.mobile}</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/10 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                          <h5 className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5 mb-2">
                            <CreditCard className="h-4 w-4 text-emerald-500" />
                            Transaction Info
                          </h5>
                          <p>Invoice No: <strong className="font-mono text-slate-700 dark:text-slate-300 font-bold">{order.invoiceNumber}</strong></p>
                          <p className="mt-0.5">Method: <strong className="font-semibold text-slate-700 dark:text-slate-300">{order.paymentMethod}</strong></p>
                          <p>Payment ID: <strong className="font-mono text-slate-700 dark:text-slate-300">{order.paymentId || '—'}</strong></p>
                          <p className="mt-1 font-semibold text-slate-500">Subtotal: {formatPrice(order.subTotal)} {order.discountAmount > 0 && `(Disc: -${formatPrice(order.discountAmount)})`}</p>
                        </div>
                      </div>

                      {/* Logistic Tracking Timeline */}
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                          <Truck className="h-4 w-4 text-emerald-500" />
                          Logistics Tracking Timeline
                        </h5>

                        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                          {timeline.map((step, sIdx) => (
                            <div key={step.label} className="relative flex items-start gap-4">
                              {/* Dot */}
                              <div className={`absolute -left-6 h-5.5 w-5.5 rounded-full border-2 flex items-center justify-center transition-colors ${step.completed
                                  ? 'bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-950 dark:border-emerald-500'
                                  : 'bg-white border-slate-200 text-slate-300 dark:bg-slate-900 dark:border-slate-800'
                                }`}>
                                {step.completed && <Check className="h-3 w-3 text-white dark:text-emerald-400" />}
                              </div>

                              <div>
                                <h6 className={`text-xs font-bold ${step.completed ? 'text-slate-800 dark:text-white' : 'text-slate-400'
                                  }`}>
                                  {step.label}
                                </h6>
                                {step.timestamp && (
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    {step.timestamp.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

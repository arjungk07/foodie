import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, FileText, ArrowLeft, Printer, Truck, Package, Clock, ShieldCheck } from 'lucide-react';
import API from '../services/api.js';
import { formatINR } from '../utils/currency.js';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      API.get(`/orders/${orderId}`)
        .then(({ data }) => setOrder(data.order))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center animate-pulse">
        <p className="text-sm font-semibold text-slate-500">Retrieving invoice details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-red-500">
        <h2 className="text-lg font-bold">Receipt Not Found</h2>
        <Link to="/products" className="mt-4 inline-block text-xs font-bold underline text-slate-650">Return to Catalog</Link>
      </div>
    );
  }

  // Tracking Progress helper
  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentStatusIndex = statuses.indexOf(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 print:py-0">
      
      {/* 1. Success Message */}
      <div className="text-center flex flex-col items-center gap-3 print:hidden">
        <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center dark:bg-emerald-950/50 dark:text-emerald-450">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
          Order Placed Successfully!
        </h1>
        <p className="text-xs text-slate-500 max-w-md">
          Thank you for shopping with Foodie. Your invoice has been generated, and items are queued for warehouse routing.
        </p>
      </div>

      {/* 2. Interactive Order Tracking (Progress Bar) */}
      <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-6 rounded-2xl shadow-sm mt-8 print:hidden transition-colors">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Truck className="h-4 w-4 text-emerald-500" />
          <span>Logistics Dispatch Tracking</span>
        </h3>

        {/* Progress Bar steps */}
        <div className="relative flex justify-between items-center w-full">
          {/* Background progress bar line */}
          <div className="absolute  left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 z-0"></div>
          <div 
            className="absolute left-0 h-1 bg-emerald-500 z-0 transition-all duration-500"
            style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
          />

          {statuses.map((step, idx) => {
            const isActive = idx <= currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;
            return (
              <div key={step} className="flex flex-col items-center  z-10 relative">
                <div 
                  className={`h-7 w-7 rounded-full mb-8 flex items-center justify-center text-xs font-bold border transition-colors ${
                    isCurrent 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                      : isActive 
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' 
                        : 'bg-white border-slate-200 text-slate-400 dark:bg-dark-card dark:border-slate-800'
                  }`}
                >
                  {idx === 0 && <Clock className="h-3.5 w-3.5" />}
                  {idx === 1 && <Package className="h-3.5 w-3.5" />}
                  {idx === 2 && <Truck className="h-3.5 w-3.5" />}
                  {idx === 3 && <ShieldCheck className="h-3.5 w-3.5" />}
                </div>
                <span className={`text-[10px] font-bold mt-2 ${isActive ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {order.trackingNumber && (
          <div className="mt-6 rounded-xl bg-slate-50 p-3 text-[10px] text-slate-600 border border-slate-200 dark:bg-dark-bg/60 dark:border-slate-850 dark:text-slate-400">
            <span className="font-bold">Carrier Reference:</span> {order.trackingNumber}
          </div>
        )}
      </div>

      {/* 3. Invoice Summary (Print-Optimized) */}
      <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-8 rounded-3xl shadow-sm mt-8 transition-colors print:border-none print:shadow-none print:bg-transparent">
        
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invoice</h2>
            <p className="text-[10px] text-slate-500 mt-1">Invoice ID: {order.invoiceNumber}</p>
            <p className="text-[10px] text-slate-400">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-500">Foodie</p>
            <p className="text-[9px] text-slate-500 mt-0.5">VAT/TAX: B2B-99887711</p>
          </div>
        </div>

        {/* Shipping address details */}
        <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-100 dark:border-slate-800 text-[10px]">
          <div>
            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Ship To</h4>
            <p className="font-bold text-slate-800 dark:text-white">{order.shippingAddress?.fullName}</p>
            <p className="text-slate-500 mt-0.5">{order.shippingAddress?.addressLine}</p>
            <p className="text-slate-500">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
            <p className="text-slate-550 mt-1">Ph: {order.shippingAddress?.mobile}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Details</h4>
            <p className="font-semibold text-slate-700 dark:text-slate-300">Method: {order.paymentMethod}</p>
            <p className={`font-bold mt-1 uppercase ${order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-500'}`}>
              Status: {order.paymentStatus}
            </p>
            {order.paymentId && <p className="text-slate-500 mt-1">Txn ID: {order.paymentId}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="py-6 border-b border-slate-100 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-850 pb-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2">Description</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item._id} className="border-b border-slate-50 dark:border-slate-900">
                  <td className="py-3 pr-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{item.productName}</p>
                  </td>
                  <td className="py-3 text-center font-medium">{item.quantity}</td>
                  <td className="py-3 text-right font-medium">{formatINR(item.price)}</td>
                  <td className="py-3 text-right font-bold text-slate-800 dark:text-slate-200">
                    {formatINR(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Subtotals */}
        <div className="pt-6 flex justify-end text-xs">
          <div className="w-64 flex flex-col gap-2">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatINR(order.subTotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Coupon discount:</span>
                <span>-{formatINR(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Freight Shipping:</span>
              <span>{order.shippingCharges === 0 ? 'FREE' : formatINR(order.shippingCharges)}</span>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-baseline font-bold text-slate-900 dark:text-white">
              <span className="text-sm">Total Paid:</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-500">{formatINR(order.totalAmount)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Controls Footer */}
      <div className="flex gap-4 mt-8 print:hidden">
        <Link
          to="/products"
          className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 px-5 py-3 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:border-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Continue Sourcing</span>
        </Link>
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-5 py-3 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-emerald-650 dark:hover:bg-emerald-700 cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          <span>Print Tax Invoice</span>
        </button>
      </div>

    </div>
  );
}

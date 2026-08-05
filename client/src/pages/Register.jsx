import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Lock, Mail, Store, User, Phone, CheckCircle2 } from 'lucide-react';
import { registerUser, clearErrors } from '../redux/slices/authSlice.js';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, successMessage, isAuthenticated } = useSelector((state) => state.auth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default to customer

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/products');
    }
  }, [isAuthenticated, navigate]);

  // Handle alerts
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearErrors());
      navigate('/login');
    }
  }, [error, successMessage, dispatch, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !email || !mobile || !password) {
      toast.warning('Please fill in all registration fields');
      return;
    }
    dispatch(registerUser({ fullName, email, mobile, password, role }));
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl shadow-xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl text-emerald-600 dark:text-emerald-500 mb-2">
            <Store className="h-6 w-6" />
            <span>Foodie</span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight">Register</h2>
          {/* <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">Start sourcing in high volume</p> */}
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-dark-bg">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              role === 'customer' 
                ? 'bg-white text-slate-900 shadow-sm dark:bg-dark-card dark:text-white' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            customer
          </button>
          <button
            type="button"
            onClick={() => setRole('seller')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              role === 'seller' 
                ? 'bg-white text-slate-900 shadow-sm dark:bg-dark-card dark:text-white' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Seller
          </button>
        </div>

        {/* Role Notice */}
        <div className="flex gap-2 rounded-xl tracking-wider  bg-emerald-50/50 p-3 text-[11px] text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-350">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
          <p>
            {role === 'customer' 
              ? 'shop products, add items to your cart or wishlist, save delivery addresses, place orders, and track your order status.'
              : 'Manage your products, stock, orders, and grow your business.'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Company/Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-655 dark:text-slate-355">
              {role === 'customer' ? 'Full Name ' : 'Seller Full Name'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={role === 'customer' ? 'Arjun' : ''}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-55/50 dark:bg-dark-card dark:border-slate-800"
              />
              <User className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-655 dark:text-slate-355">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-55/50 dark:bg-dark-card dark:border-slate-800"
              />
              <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          {/* Mobile */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-655 dark:text-slate-355">Mobile No.</label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder=""
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-55/50 dark:bg-dark-card dark:border-slate-800"
              />
              <Phone className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-655 dark:text-slate-355">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-55/50 dark:bg-dark-card dark:border-slate-800"
              />
              <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors cursor-pointer mt-2"
          >
           {role === "customer" ? "Sign In" : "Create Account"}
           {loading && "Processing..."}
          </button>

        </form>

        {/* Redirect */}
        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:underline">
            Sign In here
          </Link>
        </p>

      </div>
    </div>
  );
}

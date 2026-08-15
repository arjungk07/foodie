import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Lock, Mail, Store, User, Phone, CheckCircle2 } from 'lucide-react';
import { registerUser, clearErrors } from '../redux/slices/authSlice.js';
import logoImg from '../assets/logo.png';

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

  const handleGoogleAuth = () => {
    const serverUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000';
    window.location.href = `${serverUrl}/api/auth/google`;
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl shadow-xl flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl text-emerald-600 dark:text-emerald-500 mb-2">
            <img
              src={logoImg}
              alt="Foodie logo"
              className="w-22 h-22"
              
            />
          </Link>
          <h2 className="dancing-script text-2xl font-bold tracking-tight">Register</h2>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
        >
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Or register with email</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-dark-bg">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${role === 'customer'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-dark-card dark:text-white'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            customer
          </button>
          <button
            type="button"
            onClick={() => setRole('seller')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${role === 'seller'
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

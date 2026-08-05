import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Lock, Mail, Store, AlertCircle } from 'lucide-react';
import { loginUser, clearErrors } from '../redux/slices/authSlice.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from);
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'seller') {
        navigate('/seller');
      } else {
        navigate('/products');
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter email and password credentials');
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl shadow-xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl text-emerald-600 dark:text-emerald-500 mb-2">
            <Store className="h-6 w-6" />
            <span>Foodie</span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight">Login</h2>
          {/* <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">Access your B2B sourcing portal</p> */}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-650 dark:text-slate-350">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 dark:bg-dark-card dark:border-slate-800"
              />
              <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-650 dark:text-slate-350">Password</label>
              <Link to="/forgot-password" className="text-[10px] text-emerald-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 dark:bg-dark-card dark:border-slate-800"
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
            {loading ? 'Logging you in...' : 'Sign In'}
          </button>

        </form>

        {/* Demo login details box */}
        {/* <div className="rounded-xl bg-slate-50 p-4 text-[10px] text-slate-600 border border-slate-200 dark:bg-dark-bg/60 dark:border-slate-850 dark:text-slate-400">
          <p className="font-bold flex items-center gap-1 text-slate-850 dark:text-white mb-2">
            <AlertCircle className="h-3.5 w-3.5 text-emerald-500" />
            Demo Accounts Available:
          </p>
          <ul className="space-y-1">
            <li><span className="font-semibold text-slate-700 dark:text-slate-300">Customer:</span> customer@foodie.com / password123</li>
            <li><span className="font-semibold text-slate-700 dark:text-slate-300">Seller:</span> seller@foodie.com / password123</li>
            <li><span className="font-semibold text-slate-700 dark:text-slate-300">Admin:</span> admin@foodie.com / password123</li>
          </ul>
        </div> */}

        {/* Redirect */}
        <p className="text-center text-xs text-slate-500">
          Don't have a business account?{' '}
          <Link to="/register" className="font-semibold text-emerald-600 hover:underline">
            Register now
          </Link>
        </p>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Lock, Mail, Eye, EyeOff, User } from 'lucide-react';
import { loginUser, loadMe, clearErrors } from '../redux/slices/authSlice.js';
import logoImg from '../assets/logo.jpg';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check URL query parameters for Google OAuth callback token or error
  useEffect(() => {
    let token = null;
    let errorParam = null;

    // Check window.location.search (?token=... or ?error=...)
    if (window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      token = searchParams.get('token');
      errorParam = searchParams.get('error');
    }

    // Check location.search or HashRouter hash (?token=... or ?error=...)
    if (!token && !errorParam) {
      const searchStr = location.search || (window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
      if (searchStr) {
        const searchParams = new URLSearchParams(searchStr);
        token = searchParams.get('token');
        errorParam = searchParams.get('error');
      }
    }

    if (token) {
      localStorage.setItem('accessToken', token);
      
      // Clean up URL parameter to remove token from address bar
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      dispatch(loadMe())
        .unwrap()
        .then((userData) => {
          toast.success('Logged in with Google successfully!');
          const from = location.state?.from?.pathname;
          if (from) {
            navigate(from, { replace: true });
          } else if (userData?.role === 'admin') {
            navigate('/admin', { replace: true });
          } else if (userData?.role === 'seller') {
            navigate('/seller', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        })
        .catch((err) => {
          toast.error(err || 'Failed to fetch Google user profile');
        });
    } else if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location.search, dispatch, navigate]);

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
        navigate('/');
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
    if (!identifier || !password) {
      toast.warning('Please enter email/phone and password credentials');
      return;
    }
    dispatch(loginUser({ identifier, email: identifier, password }));
  };

  const handleGoogleAuth = () => {
    const serverUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000';
    window.location.href = `${serverUrl}/api/auth/google`;
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl shadow-xl flex flex-col gap-6">

        {/* Header */}
        <div className="text-center flex flex-col items-center">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl text-emerald-600 dark:text-emerald-500 mb-1">
            <span className='dancing-script text-3xl md:text-4xl font-extrabold'>foodie </span>
            <img
              src={logoImg}
              alt="Foodie logo"
              className="h-14 w-15"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(48%) sepia(90%) saturate(600%) hue-rotate(95deg)"
              }}
            />
          </Link>
          <h2 className="text-xl dancing-script font-extrabold tracking-wider text-slate-800 dark:text-slate-100">Welcome back to Foodie</h2>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
        >
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Or sign in with email or phone</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Email or Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[16px] dancing-script font-semibold text-slate-650 dark:text-slate-350">Email or Phone Number</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder='example@gmail.com'
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 dark:bg-dark-card dark:border-slate-800"
              />
              <User className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-lg dancing-script font-semibold text-slate-650 dark:text-slate-350">password</label>
              <Link to="/forgot-password" className="text-[10px] text-emerald-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 dark:bg-dark-card dark:border-slate-800"
              />
              <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
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

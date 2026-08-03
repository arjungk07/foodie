import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api.js';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState({ loading: true, success: false, message: '' });

  useEffect(() => {
    if (!token) {
      setStatus({ loading: false, success: false, message: 'Invalid or missing verification token link.' });
      return;
    }

    API.get(`/auth/verify-email/${token}`)
      .then((res) => {
        setStatus({
          loading: false,
          success: true,
          message: res.data.message || 'Email address verified successfully!'
        });
      })
      .catch((err) => {
        setStatus({
          loading: false,
          success: false,
          message: err.response?.data?.message || 'Email verification failed or link has expired.'
        });
      });
  }, [token]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl dark:border-slate-800/80 dark:bg-dark-card text-center">
        {status.loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Verifying your email address...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div
              className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
                status.success ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
              }`}
            >
              {status.success ? '✓' : '✕'}
            </div>
            <h2 className={`text-xl font-bold mb-2 ${status.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {status.success ? 'Email Verified!' : 'Verification Failed'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{status.message}</p>
            <Link
              to="/login"
              className="w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition"
            >
              Proceed to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

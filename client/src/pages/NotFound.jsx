import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center flex flex-col items-center justify-center gap-5">
      <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center">
        <HelpCircle className="h-10 w-10 text-emerald-500 animate-pulse" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white">404 - Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm">
        The sourcing resources, wholesale category, or dashboard tab you are looking for does not exist or has been relocated.
      </p>
      <Link 
        to="/" 
        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return Home</span>
      </Link>
    </div>
  );
}

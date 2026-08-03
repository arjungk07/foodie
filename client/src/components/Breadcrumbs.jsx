import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ paths = [] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 py-3.5" aria-label="Breadcrumb">
      <Link to="/" className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-450">
        <Home className="h-3.5 w-3.5" />
        <span>Home</span>
      </Link>
      
      {paths.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
          {item.url ? (
            <Link to={item.url} className="hover:text-emerald-600 dark:hover:text-emerald-455 hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-slate-800 dark:text-slate-350 truncate max-w-[150px] sm:max-w-[300px]">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

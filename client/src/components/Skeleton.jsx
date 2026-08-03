import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-850 dark:bg-dark-card">
      <div className="skeleton-shimmer aspect-square w-full rounded-xl bg-slate-200 dark:bg-slate-800"></div>
      <div className="mt-4 h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800 skeleton-shimmer"></div>
      <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800 skeleton-shimmer"></div>
      <div className="mt-4 flex justify-between items-center">
        <div className="h-5 w-1/4 rounded bg-slate-200 dark:bg-slate-800 skeleton-shimmer"></div>
        <div className="h-8 w-1/3 rounded-full bg-slate-200 dark:bg-slate-800 skeleton-shimmer"></div>
      </div>
    </div>
  );
};

export const TableSkeleton = () => {
  return (
    <div className="w-full space-y-3">
      <div className="skeleton-shimmer h-10 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
      <div className="skeleton-shimmer h-8 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
      <div className="skeleton-shimmer h-8 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
      <div className="skeleton-shimmer h-8 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="skeleton-shimmer h-64 w-full rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
      <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold animate-pulse">Loading Analytics Data...</span>
    </div>
  );
};

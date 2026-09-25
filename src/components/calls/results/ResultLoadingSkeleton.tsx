import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface ResultLoadingSkeletonProps {
  isPartial?: boolean;
}

export const ResultLoadingSkeleton: React.FC<ResultLoadingSkeletonProps> = ({
  isPartial = false,
}) => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between shadow-xs dark:bg-[#12161F] dark:border-[#232B3B]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-primary dark:text-blue-400 animate-spin" />
            <span className="text-xs font-semibold text-primary dark:text-blue-400 uppercase tracking-wider">
              {isPartial ? 'Synthesizing Call Intelligence (Partial Ready)' : 'Processing Call Intelligence Pipeline...'}
            </span>
          </div>
          <div className="h-5 bg-border rounded w-72 sm:w-96 dark:bg-slate-800" />
          <div className="h-3.5 bg-border/60 rounded w-64 dark:bg-slate-800/80" />
        </div>
        <div className="h-8 bg-border rounded-lg w-28 hidden md:block dark:bg-slate-800" />
      </div>

      {/* Next Best Action Skeleton */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4 shadow-xs dark:bg-[#121620] dark:border-blue-500/20">
        <div className="flex justify-between">
          <div className="h-4 bg-primary/20 rounded w-32" />
          <div className="h-4 bg-border rounded w-28 dark:bg-slate-800" />
        </div>
        <div className="h-7 bg-border rounded w-3/4 dark:bg-slate-800" />
        <div className="h-16 bg-surface-elevated rounded-lg w-full dark:bg-[#0D121C]" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-10 bg-surface-elevated rounded-lg dark:bg-slate-800/70" />
          <div className="h-10 bg-surface-elevated rounded-lg dark:bg-slate-800/70" />
          <div className="h-10 bg-surface-elevated rounded-lg dark:bg-slate-800/70" />
        </div>
      </div>

      {/* Qualification Grid Skeleton */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4 shadow-xs dark:bg-[#12161F] dark:border-[#232B3B]">
        <div className="h-4 bg-border rounded w-48 dark:bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface-elevated border border-border rounded-lg p-3 space-y-2 dark:bg-[#151A25] dark:border-[#232B3B]">
              <div className="flex justify-between">
                <div className="h-3 bg-border rounded w-16 dark:bg-slate-800" />
                <div className="h-3 bg-border rounded w-12 dark:bg-slate-800" />
              </div>
              <div className="h-4 bg-border/80 rounded w-3/4 dark:bg-slate-700" />
              <div className="h-6 bg-surface rounded w-full dark:bg-[#0A0D14]" />
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6 space-y-3 shadow-xs dark:bg-[#12161F] dark:border-[#232B3B]">
          <div className="h-4 bg-border rounded w-36 dark:bg-slate-800" />
          <div className="h-24 bg-surface-elevated rounded-lg dark:bg-[#151A25]" />
          <div className="h-24 bg-surface-elevated rounded-lg dark:bg-[#151A25]" />
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 space-y-3 shadow-xs dark:bg-[#12161F] dark:border-[#232B3B]">
          <div className="h-4 bg-border rounded w-36 dark:bg-slate-800" />
          <div className="h-24 bg-surface-elevated rounded-lg dark:bg-[#151A25]" />
          <div className="h-24 bg-surface-elevated rounded-lg dark:bg-[#151A25]" />
        </div>
      </div>
    </div>
  );
};

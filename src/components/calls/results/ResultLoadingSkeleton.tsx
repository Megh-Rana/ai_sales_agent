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
      <div className="bg-[#12161F] border border-[#232B3B] rounded-xl p-5 flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              {isPartial ? 'Synthesizing Call Intelligence (Partial Ready)' : 'Processing Call Intelligence Pipeline...'}
            </span>
          </div>
          <div className="h-5 bg-slate-800 rounded w-72 sm:w-96" />
          <div className="h-3.5 bg-slate-850 rounded w-64" />
        </div>
        <div className="h-8 bg-slate-800 rounded-lg w-28 hidden md:block" />
      </div>

      {/* Next Best Action Skeleton */}
      <div className="bg-[#121620] border border-blue-500/20 rounded-xl p-6 space-y-4">
        <div className="flex justify-between">
          <div className="h-4 bg-blue-500/20 rounded w-32" />
          <div className="h-4 bg-slate-800 rounded w-28" />
        </div>
        <div className="h-7 bg-slate-800 rounded w-3/4" />
        <div className="h-16 bg-[#0D121C] rounded-lg w-full" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-10 bg-slate-850 rounded-lg" />
          <div className="h-10 bg-slate-850 rounded-lg" />
          <div className="h-10 bg-slate-850 rounded-lg" />
        </div>
      </div>

      {/* Qualification Grid Skeleton */}
      <div className="bg-[#12161F] border border-[#232B3B] rounded-xl p-6 space-y-4">
        <div className="h-4 bg-slate-800 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-[#151A25] border border-[#232B3B] rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <div className="h-3 bg-slate-800 rounded w-16" />
                <div className="h-3 bg-slate-800 rounded w-12" />
              </div>
              <div className="h-4 bg-slate-700 rounded w-3/4" />
              <div className="h-6 bg-[#0A0D14] rounded w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#12161F] border border-[#232B3B] rounded-xl p-6 space-y-3">
          <div className="h-4 bg-slate-800 rounded w-36" />
          <div className="h-24 bg-[#151A25] rounded-lg" />
          <div className="h-24 bg-[#151A25] rounded-lg" />
        </div>
        <div className="bg-[#12161F] border border-[#232B3B] rounded-xl p-6 space-y-3">
          <div className="h-4 bg-slate-800 rounded w-36" />
          <div className="h-24 bg-[#151A25] rounded-lg" />
          <div className="h-24 bg-[#151A25] rounded-lg" />
        </div>
      </div>
    </div>
  );
};

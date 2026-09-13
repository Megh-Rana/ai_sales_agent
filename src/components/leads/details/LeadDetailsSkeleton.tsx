import React from 'react';
import { Skeleton } from '../../feedback/Skeleton';

export const LeadDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2 animate-fadeIn" aria-busy="true" aria-label="Loading lead intelligence profile">
      {/* Header Skeleton */}
      <div className="p-5 bg-surface-0 border border-border-default rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="w-48 h-6 rounded-md" />
              <Skeleton className="w-64 h-3.5 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-24 h-9 rounded-lg" />
            <Skeleton className="w-28 h-9 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Summary Bar Skeleton */}
      <div className="p-4 bg-surface-0 border border-border-default rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
        </div>
      </div>

      {/* 2-Column Asymmetric Workspace Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (62% - 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 bg-surface-0 border border-border-default rounded-xl space-y-3">
            <Skeleton className="w-40 h-5 rounded" />
            <Skeleton className="w-full h-16 rounded-lg" />
            <Skeleton className="w-3/4 h-4 rounded" />
          </div>

          <div className="p-5 bg-surface-0 border border-border-default rounded-xl space-y-3">
            <Skeleton className="w-32 h-5 rounded" />
            <Skeleton className="w-full h-20 rounded-lg" />
          </div>

          <div className="p-5 bg-surface-0 border border-border-default rounded-xl space-y-3">
            <Skeleton className="w-44 h-5 rounded" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Right Column (38% - 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 bg-surface-0 border border-border-default rounded-xl space-y-3">
            <Skeleton className="w-36 h-5 rounded" />
            <Skeleton className="w-full h-24 rounded-lg" />
          </div>

          <div className="p-5 bg-surface-0 border border-border-default rounded-xl space-y-3">
            <Skeleton className="w-40 h-5 rounded" />
            <Skeleton className="w-full h-32 rounded-lg" />
          </div>

          <div className="p-5 bg-surface-0 border border-border-default rounded-xl space-y-3">
            <Skeleton className="w-32 h-5 rounded" />
            <Skeleton className="w-full h-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

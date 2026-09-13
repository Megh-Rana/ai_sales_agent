import React from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return <div className={clsx('animate-pulse bg-surface-elevated rounded', className)} />;
};

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`p-5 bg-surface-0 border border-border-default rounded-xl space-y-4 animate-pulse ${className || ''}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>
      <Skeleton className="w-16 h-6 rounded-md" />
    </div>
    <Skeleton className="w-full h-12 rounded-md" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="w-24 h-4" />
      <Skeleton className="w-20 h-8 rounded-md" />
    </div>
  </div>
);

export const MetricSkeleton: React.FC = () => (
  <div className="p-4 bg-surface-0 border border-border-default rounded-xl space-y-3 animate-pulse">
    <Skeleton className="w-24 h-3" />
    <Skeleton className="w-32 h-8" />
    <Skeleton className="w-20 h-3" />
  </div>
);

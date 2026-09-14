import React from 'react';

export const ActionCenterSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface-0 border border-border-default rounded-xl p-4 h-24 flex items-center justify-between"
          >
            <div className="space-y-2 w-2/3">
              <div className="h-3 bg-surface-elevated rounded w-3/4" />
              <div className="h-6 bg-surface-hover rounded w-1/2" />
            </div>
            <div className="w-10 h-10 bg-surface-elevated rounded-xl" />
          </div>
        ))}
      </div>

      {/* Action Cards Queue */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface-0 border border-border-default rounded-xl p-6 h-64 flex flex-col justify-between"
          >
            <div className="h-5 bg-surface-elevated rounded w-1/4 mb-3" />
            <div className="h-6 bg-surface-hover rounded w-1/2 mb-2" />
            <div className="h-16 bg-surface-elevated rounded w-full mb-4" />
            <div className="h-10 bg-surface-hover rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

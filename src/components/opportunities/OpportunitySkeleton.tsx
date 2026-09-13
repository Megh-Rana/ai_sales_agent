import React from 'react';

export const OpportunitySkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-5 rounded-xl bg-surface-0 border border-border-default space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="flex gap-2">
                <div className="h-5 w-24 bg-surface-1 rounded" />
                <div className="h-5 w-28 bg-surface-1 rounded" />
              </div>
              <div className="h-6 w-48 bg-surface-1 rounded" />
              <div className="h-4 w-64 bg-surface-1 rounded" />
            </div>
            <div className="h-10 w-16 bg-surface-1 rounded" />
          </div>

          <div className="h-20 bg-surface-1 rounded-lg" />

          <div className="flex justify-between items-center pt-2">
            <div className="h-4 w-40 bg-surface-1 rounded" />
            <div className="h-8 w-32 bg-surface-1 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

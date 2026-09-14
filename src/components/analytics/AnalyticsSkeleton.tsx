import React from 'react';

export const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* KPI Row Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-xl p-5 h-28 flex flex-col justify-between"
          >
            <div className="h-3 bg-surface-elevated rounded w-2/3" />
            <div className="h-7 bg-surface-hover rounded w-1/2" />
            <div className="h-3 bg-surface-elevated rounded w-3/4" />
          </div>
        ))}
      </div>

      {/* Row 2: Funnel + Intent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6 h-96 flex flex-col justify-between">
          <div className="h-5 bg-surface-elevated rounded w-1/3 mb-4" />
          <div className="space-y-4 flex-1">
            <div className="h-10 bg-surface-elevated rounded w-full" />
            <div className="h-10 bg-surface-elevated rounded w-4/5" />
            <div className="h-10 bg-surface-elevated rounded w-2/3" />
            <div className="h-10 bg-surface-elevated rounded w-1/2" />
          </div>
          <div className="h-12 bg-surface-elevated rounded w-full mt-4" />
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 h-96 flex flex-col justify-between">
          <div className="h-5 bg-surface-elevated rounded w-1/3 mb-4" />
          <div className="space-y-5 flex-1">
            <div className="h-12 bg-surface-elevated rounded w-full" />
            <div className="h-12 bg-surface-elevated rounded w-full" />
            <div className="h-12 bg-surface-elevated rounded w-full" />
          </div>
          <div className="h-6 bg-surface-elevated rounded w-1/2 mt-4" />
        </div>
      </div>

      {/* Row 3: Call Performance + Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6 h-80 flex flex-col justify-between">
          <div className="h-5 bg-surface-elevated rounded w-1/3 mb-4" />
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="bg-surface-elevated rounded-lg p-3" />
            <div className="bg-surface-elevated rounded-lg p-3" />
            <div className="bg-surface-elevated rounded-lg p-3" />
            <div className="bg-surface-elevated rounded-lg p-3" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 h-80 flex flex-col justify-between">
          <div className="h-5 bg-surface-elevated rounded w-1/3 mb-4" />
          <div className="space-y-3 flex-1">
            <div className="h-8 bg-surface-elevated rounded w-full" />
            <div className="h-8 bg-surface-elevated rounded w-full" />
            <div className="h-8 bg-surface-elevated rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

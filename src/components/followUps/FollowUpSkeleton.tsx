import React from 'react';

export const FollowUpSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 bg-surface-1 border border-border-subtle rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-surface-1 border border-border-subtle rounded-xl" />
        ))}
      </div>
    </div>
  );
};

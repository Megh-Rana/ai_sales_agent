import React from 'react';

export const CampaignSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[#12161F] border border-[#1E2638] rounded-xl p-6 h-64 flex flex-col justify-between"
          >
            <div className="h-5 bg-[#1A202C] rounded w-1/3 mb-3" />
            <div className="h-6 bg-[#242C3D] rounded w-2/3 mb-4" />
            <div className="h-4 bg-[#1A202C] rounded w-full mb-3" />
            <div className="h-10 bg-[#242C3D] rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

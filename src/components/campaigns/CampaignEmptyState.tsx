import React from 'react';
import { Target, Plus, Search } from 'lucide-react';

interface CampaignEmptyStateProps {
  onOpenCreateModal: () => void;
}

export const CampaignEmptyState: React.FC<CampaignEmptyStateProps> = ({ onOpenCreateModal }) => {
  return (
    <div className="bg-[#12161F] border border-[#1E2638] rounded-xl p-8 md:p-12 text-center shadow-sm my-6">
      <div className="max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
          <Target className="w-7 h-7" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#F8FAFC]">No active campaigns yet</h2>
          <p className="text-sm text-[#94A3B8] leading-relaxed">
            Turn high-intent discovered leads into structured outreach cadences. Create your first campaign to get started.
          </p>
        </div>
        <div className="pt-4 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>
    </div>
  );
};

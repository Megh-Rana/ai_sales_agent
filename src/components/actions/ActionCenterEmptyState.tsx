import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Search, BarChart3, Sparkles } from 'lucide-react';

interface ActionCenterEmptyStateProps {
  onResetFilter?: () => void;
}

export const ActionCenterEmptyState: React.FC<ActionCenterEmptyStateProps> = ({ onResetFilter }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#12161F] border border-emerald-500/30 rounded-xl p-8 md:p-12 text-center shadow-sm my-6">
      <div className="max-w-md mx-auto space-y-4">
        {/* Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
        </div>

        {/* Heading & Description */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#F8FAFC]">You're all caught up!</h2>
          <p className="text-sm text-[#94A3B8] leading-relaxed">
            There are no urgent sales actions requiring immediate attention right now. All touchpoints, calls, and follow-up cadences are up to date.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/leads/discover')}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span>Discover New Leads</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/analytics')}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-[#1A202C] hover:bg-[#242C3D] text-[#F8FAFC] border border-[#2B354C] text-xs font-semibold transition-all"
          >
            <BarChart3 className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <span>View Sales Analytics</span>
          </button>
        </div>

        {onResetFilter && (
          <p className="text-xs text-[#64748B] pt-2">
            Or try{' '}
            <button
              type="button"
              onClick={onResetFilter}
              className="text-blue-400 underline font-medium hover:text-blue-300"
            >
              resetting priority filter
            </button>
            .
          </p>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Search, PhoneCall, Sparkles } from 'lucide-react';

interface AnalyticsEmptyStateProps {
  onResetFilter?: () => void;
}

export const AnalyticsEmptyState: React.FC<AnalyticsEmptyStateProps> = ({ onResetFilter }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-surface border border-border rounded-xl p-8 md:p-12 text-center shadow-sm my-6">
      <div className="max-w-md mx-auto space-y-4">
        {/* Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
          <BarChart3 className="w-7 h-7" />
        </div>

        {/* Heading & Description */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Not enough activity yet</h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Analytics will become more useful as leads, calls, and follow-ups accumulate in your workspace pipeline.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/leads/discover')}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span>Discover High Intent Leads</span>
          </button>

          <button
            onClick={() => navigate('/calls')}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-surface-elevated hover:bg-surface-hover text-foreground border border-border-strong text-xs font-semibold transition-all"
          >
            <PhoneCall className="w-4 h-4 text-blue-400" />
            <span>Launch AI Calls</span>
          </button>
        </div>

        {onResetFilter && (
          <p className="text-xs text-foreground-tertiary pt-2">
            Or try selecting a different date range or{' '}
            <button
              onClick={onResetFilter}
              className="text-blue-400 underline font-medium hover:text-blue-300"
            >
              resetting date filter
            </button>
            .
          </p>
        )}
      </div>
    </div>
  );
};

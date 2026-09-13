import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface CampaignErrorStateProps {
  onRetry: () => void;
}

export const CampaignErrorState: React.FC<CampaignErrorStateProps> = ({ onRetry }) => {
  return (
    <div className="bg-[#12161F] border border-rose-500/30 rounded-xl p-8 md:p-12 text-center shadow-sm my-6">
      <div className="max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#F8FAFC]">Campaigns couldn't be loaded</h2>
          <p className="text-sm text-[#94A3B8]">
            We encountered a temporary issue fetching your campaign telemetry. Please check your connection and try again.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-white text-xs font-semibold transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Try again</span>
          </button>
        </div>
      </div>
    </div>
  );
};

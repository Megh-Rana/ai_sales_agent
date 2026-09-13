import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { CampaignMomentumSummary } from '../../types/commandCenter';

interface CampaignMomentumCardProps {
  campaigns: CampaignMomentumSummary[];
}

export const CampaignMomentumCard: React.FC<CampaignMomentumCardProps> = ({ campaigns }) => {
  const navigate = useNavigate();

  return (
    <div className="p-5 rounded-xl bg-surface-0 border border-border-default space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="text-h4 font-bold text-foreground tracking-tight">
            Outreach Cadence Momentum ({(campaigns || []).length} Active)
          </h3>
        </div>

        <button
          type="button"
          onClick={() => navigate('/campaigns')}
          className="text-xs text-foreground-tertiary hover:text-foreground flex items-center gap-1 cursor-pointer"
        >
          <span>View All Campaigns</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(campaigns || []).map((camp) => (
          <div
            key={camp.id}
            className="p-3.5 rounded-xl bg-surface-1 border border-border-subtle space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-small font-bold text-foreground truncate">{camp.name}</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {camp.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-small pt-1">
              <div>
                <div className="text-caption text-foreground-tertiary">Response Rate</div>
                <div className="font-mono font-bold text-emerald-400">{camp.responseRate}%</div>
              </div>
              <div>
                <div className="text-caption text-foreground-tertiary">Replies Today</div>
                <div className="font-mono font-bold text-foreground">+{camp.positiveRepliesToday} Positive</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

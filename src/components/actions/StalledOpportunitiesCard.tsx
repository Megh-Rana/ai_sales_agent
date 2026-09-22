import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StalledDealItem } from '../../types/actions';
import { AlertOctagon, PhoneCall } from 'lucide-react';

interface StalledOpportunitiesCardProps {
  deals: StalledDealItem[];
}

export const StalledOpportunitiesCard: React.FC<StalledOpportunitiesCardProps> = ({ deals }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-surface border border-border-strong rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <AlertOctagon className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Stalled Opportunities Recovery</h2>
              <p className="text-xs text-foreground-secondary">
                Deals sitting &gt; 48 hours without a touchpoint
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
            {deals.length} Stalled
          </span>
        </div>

        {/* List of Stalled Deals */}
        <div className="space-y-3 mb-4">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-surface-elevated border border-border hover:border-border-strong rounded-lg p-3.5 transition-all duration-150 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs text-foreground">{deal.companyName}</h3>
                  <span className="text-[11px] text-foreground-tertiary">{deal.industry}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-danger block">{deal.daysIdle} days idle</span>
                  <span className="text-[11px] text-foreground-secondary">{deal.estimatedValue}</span>
                </div>
              </div>

              {/* Recommended Re-engagement Angle */}
              <div className="bg-surface p-2 rounded text-[11px] text-foreground-secondary border border-border space-y-0.5">
                <span className="text-indigo-400 font-semibold block">Recommended Hook:</span>
                <p className="leading-snug">{deal.recommendedAngle}</p>
              </div>

              {/* CTA */}
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/calls')}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-all focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                  <span className="text-white font-semibold">Re-engage Call</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border text-xs text-foreground-tertiary flex items-center justify-between">
        <span>Automated inactivity alerts active</span>
        <span className="text-indigo-400 font-semibold font-mono">Action Recommended</span>
      </div>
    </div>
  );
};

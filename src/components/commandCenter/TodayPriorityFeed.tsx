import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Sparkles, PhoneCall, ArrowRight, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { TodayPriorityItem } from '../../types/commandCenter';

interface TodayPriorityFeedProps {
  items: TodayPriorityItem[];
}

export const TodayPriorityFeed: React.FC<TodayPriorityFeedProps> = ({ items }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Flame className="w-4 h-4" />
          </div>
          <h2 className="text-h4 font-bold text-foreground tracking-tight">
            Today's Priority Focus ({(items || []).length})
          </h2>
        </div>
        <span className="text-caption font-mono text-foreground-tertiary">
          Sorted by Intent Score & Signal Urgency
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(items || []).map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl bg-surface border border-warning/40 hover:border-warning/70 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header Badge Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-950 dark:text-amber-200 border border-amber-500/40">
                    🔥 HIGH PRIORITY
                  </span>
                  <span className="text-caption font-mono text-foreground-tertiary">
                    {item.whyNowRecency}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {item.intentScore}/100
                  </span>
                </div>
              </div>

              {/* Lead & Company Info */}
              <div>
                <h3
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/leads/${item.leadId}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/leads/${item.leadId}`);
                    }
                  }}
                  aria-label={`View lead details for ${item.companyName}`}
                  className="text-h4 font-bold text-foreground hover:text-primary transition-colors cursor-pointer focus:outline-none focus:underline"
                >
                  {item.companyName}
                </h3>
                <div className="text-small text-foreground-secondary mt-0.5">
                  <span className="font-medium text-foreground">{item.contactName}</span> • {item.contactRole} •{' '}
                  <span className="font-mono text-amber-400 font-medium">{item.estimatedValue}</span>
                </div>
              </div>

              {/* Why Now Box */}
              <div className="p-3 rounded-lg bg-surface-1 border border-border-subtle space-y-1">
                <div className="text-[11px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>WHY NOW</span>
                </div>
                <p className="text-small font-medium text-foreground leading-snug">
                  {item.whyNowHeadline}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => navigate(`/copilot/${item.leadId}`)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-amber-400 bg-surface-1 hover:bg-surface-hover border border-amber-500/30 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prepare Pitch</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/calls?leadId=${item.leadId}`)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Dispatch Call</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

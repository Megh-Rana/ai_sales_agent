import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnalyticsInsight } from '../../types/analytics';
import { Sparkles, ArrowRight, Lightbulb, CheckCircle2 } from 'lucide-react';

interface AnalyticsInsightCardProps {
  insight: AnalyticsInsight;
}

export const AnalyticsInsightCard: React.FC<AnalyticsInsightCardProps> = ({ insight }) => {
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (insight.ctaTarget) {
      navigate(insight.ctaTarget);
    }
  };

  return (
    <div className="bg-[#12161F] border border-[#1E2638] hover:border-[#2B354C] rounded-xl p-5 shadow-sm transition-all duration-200 flex flex-col justify-between h-full group">
      <div>
        {/* Category Header Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{insight.categoryLabel}</span>
          </div>
          <span className="text-[11px] font-mono text-[#64748B]">Operational Intelligence</span>
        </div>

        {/* Insight Title */}
        <h3 className="text-base font-bold text-[#F8FAFC] tracking-tight mb-3 leading-snug group-hover:text-blue-300 transition-colors">
          {insight.title}
        </h3>

        {/* Structured 3-Part Explanation: Evidence, Why It Matters, Recommended */}
        <div className="space-y-3 mb-5 text-xs">
          {/* WHAT HAPPENED / EVIDENCE */}
          <div className="bg-[#0B0E14] border border-[#1E2638] rounded-lg p-3 space-y-1">
            <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Observed Data Evidence
            </span>
            <p className="text-[#94A3B8] leading-relaxed">{insight.evidence}</p>
          </div>

          {/* WHY IT MATTERS */}
          <div className="space-y-0.5 px-1">
            <span className="text-[11px] font-semibold text-amber-400 flex items-center space-x-1">
              <span>Why It Matters:</span>
            </span>
            <p className="text-[#94A3B8] leading-relaxed pl-0.5">{insight.whyItMatters}</p>
          </div>

          {/* WHAT TO DO / RECOMMENDED ACTION */}
          <div className="space-y-0.5 px-1">
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1">
              <span>Recommended Action:</span>
            </span>
            <p className="text-[#F8FAFC] font-medium leading-relaxed pl-0.5">
              {insight.recommendedAction}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      {insight.ctaLabel && (
        <div className="pt-3 border-t border-[#1E2638]">
          <button
            onClick={handleCtaClick}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-white font-semibold text-xs transition-all duration-150 shadow-sm"
          >
            <span>{insight.ctaLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

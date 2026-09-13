import React from 'react';
import { StageConversionMetric } from '../../types/analytics';
import { Target, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';

interface ConversionPerformanceCardProps {
  conversions: StageConversionMetric[];
}

export const ConversionPerformanceCard: React.FC<ConversionPerformanceCardProps> = ({
  conversions,
}) => {
  return (
    <div className="bg-[#12161F] border border-[#1E2638] rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#F8FAFC]">Stage Conversion Ratios</h2>
              <p className="text-xs text-[#94A3B8]">
                Key conversion benchmarks across sales touchpoints
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
            High Efficiency
          </span>
        </div>

        {/* Conversion Cards Grid */}
        <div className="space-y-4 mb-4">
          {conversions.map((conv) => {
            const isAbove = conv.rate >= conv.benchmark;

            return (
              <div
                key={conv.id}
                className="bg-[#0B0E14] border border-[#1E2638] hover:border-[#2B354C] rounded-lg p-4 transition-all duration-150"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#F8FAFC]">{conv.title}</span>
                  <span className="text-[11px] text-[#64748B] font-mono">
                    Benchmark: {conv.benchmark}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold text-[#F8FAFC] font-mono">
                      {conv.rate}%
                    </span>
                    <span className="text-xs text-[#94A3B8]">
                      ({conv.fromStage} → {conv.toStage})
                    </span>
                  </div>

                  <div
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold ${
                      isAbove
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {isAbove ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    <span>+{conv.trendPercentage}%</span>
                  </div>
                </div>

                {/* Progress bar relative to benchmark */}
                <div className="w-full bg-[#1A202C] h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full ${
                      isAbove ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(conv.rate, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-[#1E2638] text-xs text-[#64748B] flex items-center justify-between">
        <span>Updated real-time from touchpoint events</span>
        <span className="text-emerald-400 font-semibold font-mono">3 / 3 Above Benchmark</span>
      </div>
    </div>
  );
};

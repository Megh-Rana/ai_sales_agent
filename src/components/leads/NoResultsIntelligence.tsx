import React from 'react';
import { SearchX, FilterX, ArrowUpRight, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface NoResultsIntelligenceProps {
  query: string;
  activeFilterCount: number;
  onClearFilters: () => void;
  onRelaxIntent?: () => void;
  onExpandFreshness?: () => void;
  onClearQuery?: () => void;
}

export const NoResultsIntelligence: React.FC<NoResultsIntelligenceProps> = ({
  query,
  activeFilterCount,
  onClearFilters,
  onRelaxIntent,
  onExpandFreshness,
  onClearQuery
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
        <SearchX className="w-7 h-7 text-indigo-400" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-slate-100">
          No matching commercial signals detected
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
          {query ? (
            <>
              Vidur scanned public RFPs, job boards, and industry feeds for{' '}
              <span className="text-slate-200 font-medium">"{query}"</span>, but none met your current
              filter constraints.
            </>
          ) : (
            'Vidur scanned available telemetry feeds, but no active leads match all applied filters.'
          )}
        </p>
      </div>

      {/* Diagnostic Suggestions */}
      <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 text-left space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Recommended Filter Adjustments</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {query && (
            <button
              onClick={onClearQuery}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
            >
              <span>Clear keyword search</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}

          <button
            onClick={onRelaxIntent}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
          >
            <span>Lower minimum Intent threshold to Medium (50+)</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={onExpandFreshness}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
          >
            <span>Expand Signal Window to Past 30 Days</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Global reset button */}
      {activeFilterCount > 0 && (
        <div className="pt-2 flex justify-center">
          <Button
            variant="secondary"
            onClick={onClearFilters}
            className="flex items-center gap-2 text-xs"
          >
            <FilterX className="w-4 h-4 text-slate-400" />
            <span>Reset All Active Filters ({activeFilterCount})</span>
          </Button>
        </div>
      )}
    </div>
  );
};

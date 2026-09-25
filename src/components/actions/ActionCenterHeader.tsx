import React from 'react';
import { ActionPriorityLevel } from '../../types/actions';
import { Target, Filter, RefreshCw, Sparkles } from 'lucide-react';

interface ActionCenterHeaderProps {
  activePriority: 'ALL' | ActionPriorityLevel;
  onPriorityChange: (priority: 'ALL' | ActionPriorityLevel) => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  viewState: 'normal' | 'loading' | 'empty' | 'error';
  onViewStateChange: (state: 'normal' | 'loading' | 'empty' | 'error') => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const ActionCenterHeader: React.FC<ActionCenterHeaderProps> = ({
  activePriority,
  onPriorityChange,
  activeCategory,
  onCategoryChange,
  viewState,
  onViewStateChange,
  onRefresh,
  isRefreshing = false,
}) => {
  const priorityOptions: { id: 'ALL' | ActionPriorityLevel; label: string }[] = [
    { id: 'ALL', label: 'All Actions' },
    { id: 'CRITICAL', label: 'Critical' },
    { id: 'HIGH', label: 'High' },
    { id: 'MEDIUM', label: 'Medium' },
  ];

  const categoryOptions = [
    { id: 'all', label: 'All Types' },
    { id: 'call', label: 'Calls' },
    { id: 'followup', label: 'Follow-ups' },
    { id: 'pitch', label: 'Pitches' },
  ];

  return (
    <header className="bg-surface-0 border border-border-default rounded-xl p-5 md:p-6 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Target className="w-5 h-5" aria-hidden="true" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
              Sales Action Center
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Orchestration Hub
            </span>
          </div>
          <p className="text-sm text-foreground-secondary font-normal pl-0.5">
            Intelligent next best actions prioritized by buying intent, RFP signals & follow-up speed.
          </p>
        </div>

        {/* Filters & Actions Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Priority Filter */}
          <nav
            aria-label="Action Priority Filter Options"
            className="inline-flex items-center p-1 rounded-lg bg-surface-1 border border-border-subtle text-xs font-medium"
          >
            {priorityOptions.map((opt) => {
              const isSelected = activePriority === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onPriorityChange(opt.id)}
                  aria-pressed={isSelected}
                  className={`px-3 py-1.5 rounded-md transition-all duration-150 capitalize font-medium ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm font-semibold'
                      : 'text-foreground-secondary hover:text-foreground hover:bg-surface-elevated'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </nav>

          {/* Category Filter */}
          <div className="hidden sm:inline-flex items-center p-1 rounded-lg bg-surface-1 border border-border-subtle text-xs font-medium">
            {categoryOptions.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                aria-pressed={activeCategory === cat.id}
                className={`px-2.5 py-1.5 rounded-md transition-all duration-150 capitalize font-medium ${
                  activeCategory === cat.id
                    ? 'bg-surface-hover text-foreground font-semibold'
                    : 'text-foreground-tertiary hover:text-foreground-secondary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh Sales Action Queue"
              className="p-2 rounded-lg bg-surface-elevated hover:bg-surface-hover text-foreground-secondary hover:text-foreground border border-border-subtle transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

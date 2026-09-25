import React, { useState } from 'react';
import { CalendarCheck, Clock, Mail, PhoneCall, Check, ArrowRight, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { FollowUpItem } from '../../data/dashboard';
import { Button } from '../ui/Button';

export interface FollowUpQueueProps {
  items: FollowUpItem[];
  onComplete?: (id: string) => void;
  className?: string;
  isHighlighted?: boolean;
}

export const FollowUpQueue: React.FC<FollowUpQueueProps> = ({
  items,
  onComplete,
  className = '',
  isHighlighted = false,
}) => {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleToggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    if (onComplete) {
      onComplete(id);
    }
  };

  const getActionIcon = (type: FollowUpItem['actionType']) => {
    switch (type) {
      case 'call':
        return <PhoneCall className="w-3.5 h-3.5 text-primary" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-info" />;
      case 'linkedin':
        return <CalendarCheck className="w-3.5 h-3.5 text-signal-high" />;
    }
  };

  return (
    <div
      id="dashboard-followup-queue"
      className={`bg-surface-0 border rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs transition-all ${
        isHighlighted
          ? 'border-primary ring-2 ring-primary/40 shadow-md'
          : 'border-border-default'
      } ${className}`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-surface-1 text-signal-qualified border border-border-subtle">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-body font-bold text-foreground">Follow-Up Commitments</h4>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-signal-high-muted text-signal-high border border-signal-high/30">
                {items.length - completedIds.length} Due
              </span>
            </div>
            <div className="text-[11px] text-foreground-tertiary">Touchpoints scheduled across active pipeline</div>
          </div>
        </div>

        <Link
          to="/follow-ups"
          className="text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-1"
        >
          <span>All ({items.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* List of items */}
      <div className="space-y-2">
        {items.map((item) => {
          const isDone = completedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => navigate(`/leads/${item.opportunityId}`)}
              className={`p-3 rounded-lg border transition-all text-xs cursor-pointer group select-none ${
                isDone
                  ? 'bg-surface-0 border-border-subtle opacity-50'
                  : item.isUrgent
                  ? 'bg-surface-1 border-signal-high/60 hover:border-signal-high shadow-sm'
                  : 'bg-surface-1 hover:bg-surface-elevated border-border-default hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="p-1 rounded bg-surface-elevated shrink-0">
                    {getActionIcon(item.actionType)}
                  </span>
                  <span className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {item.companyName}
                  </span>
                  <span className="text-[10px] text-foreground-tertiary truncate">
                    ({item.contactName})
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                      item.isUrgent
                        ? 'bg-signal-high-muted text-signal-high border border-signal-high/30 animate-pulse'
                        : 'bg-surface-elevated text-foreground-tertiary'
                    }`}
                  >
                    {item.dueText}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleToggleComplete(item.id, e)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-signal-qualified border-signal-qualified text-background'
                        : 'border-border-default hover:border-primary text-transparent hover:text-foreground-tertiary'
                    }`}
                    title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className={`text-caption leading-relaxed pl-6 ${isDone ? 'line-through text-foreground-tertiary' : 'text-foreground'}`}>
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

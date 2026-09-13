import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, ArrowRight } from 'lucide-react';

export const FollowUpQueueCard: React.FC = () => {
  const navigate = useNavigate();

  const items = [
    {
      id: 'fu-1',
      company: 'Apex HealthTech',
      contact: 'Dr. Ananya Patel (CIO)',
      type: 'SEND_PRICING',
      title: 'Send formal HIPAA voice agent proposal',
      due: 'Today 4:00 PM',
      priority: 'HIGH',
      target: '/leads/lead-2',
    },
    {
      id: 'fu-2',
      company: 'LogiTech Solutions',
      contact: 'Sunil Kumar (Ops Lead)',
      type: 'SCHEDULE_DEMO',
      title: 'Confirm technical demo agenda for Friday',
      due: 'Today 5:30 PM',
      priority: 'MEDIUM',
      target: '/leads/lead-1',
    },
    {
      id: 'fu-3',
      company: 'FinServe India',
      contact: 'Sanjay Verma (VP Sales)',
      type: 'CALL_AGAIN',
      title: 'Follow-up on loan origination integration brief',
      due: 'Tomorrow 11:00 AM',
      priority: 'MEDIUM',
      target: '/calls',
    },
  ];

  return (
    <div className="bg-surface border border-border-strong rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <CalendarClock className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Follow-up Dispatch Queue</h2>
              <p className="text-xs text-foreground-secondary">
                Pending touchpoints & scheduled task cadences
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-warning bg-warning-muted px-2.5 py-1 rounded-md border border-warning/30">
            3 Due
          </span>
        </div>

        {/* Queue Items */}
        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-surface-elevated border border-border hover:border-border-strong rounded-lg p-3 transition-all duration-150 flex items-center justify-between"
            >
              <div className="space-y-0.5 max-w-[70%]">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-foreground truncate">
                    {item.company}
                  </span>
                  <span className="text-[10px] font-semibold text-warning bg-warning-muted px-1.5 py-0.2 rounded border border-warning/30">
                    {item.priority}
                  </span>
                </div>
                <p className="text-[11px] text-foreground-secondary truncate">{item.title}</p>
                <span className="text-[10px] text-foreground-tertiary block font-mono">{item.due}</span>
              </div>

              <button
                type="button"
                onClick={() => navigate(item.target)}
                className="p-2 rounded-lg bg-surface hover:bg-surface-hover text-foreground-secondary hover:text-foreground border border-border transition-all"
                title="Execute Follow-up"
              >
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border text-xs text-foreground-tertiary flex items-center justify-between">
        <span>Follow-up dispatch cadence active</span>
        <span className="text-warning font-semibold font-mono">100% On Schedule</span>
      </div>
    </div>
  );
};

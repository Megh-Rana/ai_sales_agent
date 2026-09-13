import React from 'react';
import { PhoneCall, Clock, CheckCircle2, CalendarCheck, ArrowRight } from 'lucide-react';

export const CampaignCadenceProgress: React.FC = () => {
  const steps = [
    {
      day: 'Day 0',
      title: 'AI Voice Call Session',
      desc: 'Autonomous call with BANT qualification hook.',
      status: 'active',
      icon: <PhoneCall className="w-4 h-4 text-primary" aria-hidden="true" />,
    },
    {
      day: 'Day 2',
      title: 'Follow-up Pricing Proposal',
      desc: 'Dispatches pricing proposal if requested during call.',
      status: 'queued',
      icon: <Clock className="w-4 h-4 text-amber-400" aria-hidden="true" />,
    },
    {
      day: 'Day 5',
      title: 'Executive Demo Scheduled',
      desc: 'Confirmed demo booking routed to account rep queue.',
      status: 'queued',
      icon: <CalendarCheck className="w-4 h-4 text-signal-qualified" aria-hidden="true" />,
    },
  ];

  return (
    <div className="bg-surface-0 border border-border-default rounded-xl p-5 md:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-h3 font-semibold text-foreground">Outreach Cadence Sequence</h2>
          <p className="text-caption text-foreground-tertiary">Automated multi-step sales touchpoint workflow</p>
        </div>
        <span className="text-caption font-mono font-medium text-primary bg-primary-muted px-2.5 py-1 rounded-md border border-primary/30">
          3 Sequence Steps
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((st) => (
          <div
            key={st.day}
            className={`p-4 rounded-xl border relative transition-all ${
              st.status === 'active'
                ? 'bg-primary-muted border-primary/40 text-foreground'
                : 'bg-surface-1 border-border-subtle text-foreground-tertiary'
            }`}
          >
            <div className="flex items-center justify-between text-caption mb-2">
              <span className="font-mono font-bold text-primary bg-surface-0 px-2 py-0.5 rounded border border-border-subtle">
                {st.day}
              </span>
              {st.status === 'active' && (
                <span className="text-[10px] font-bold text-signal-qualified uppercase tracking-wider">
                  Active Step
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 mb-1">
              {st.icon}
              <h3 className="font-bold text-small text-foreground">{st.title}</h3>
            </div>
            <p className="text-caption text-foreground-tertiary leading-snug">{st.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

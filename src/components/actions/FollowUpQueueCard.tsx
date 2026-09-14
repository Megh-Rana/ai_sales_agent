import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, ArrowRight } from 'lucide-react';
import { useI18n } from '../../i18n/i18nContext';

export const FollowUpQueueCard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

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
    <div className="bg-surface border border-pastelPetal/20 rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between h-full hover:border-pastelPetal/40 transition-colors">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-pastelPetal/10 text-pastelPetal border border-pastelPetal/30">
              <CalendarClock className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">{t.actions.followUpQueue.title}</h2>
              <p className="text-xs text-foreground-secondary">
                {t.actions.followUpQueue.subtitle}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-foreground bg-pastelPetal/20 px-2.5 py-1 rounded-md border border-pastelPetal/40">
            3 {t.actions.followUpQueue.due}
          </span>
        </div>

        {/* Queue Items */}
        <div className="space-y-2.5 mb-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-surface-elevated border border-border hover:border-pastelPetal/40 rounded-lg p-3.5 transition-all duration-200 flex items-center justify-between gap-3"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-foreground">
                    {item.company}
                  </span>
                  <span className="text-[10px] font-bold text-foreground bg-warning/20 px-2 py-0.5 rounded border border-warning/40">
                    {item.priority}
                  </span>
                </div>
                <p className="text-xs text-foreground-secondary leading-relaxed">{item.title}</p>
                <span className="text-[10px] text-foreground-tertiary block font-mono">{item.due}</span>
              </div>

              <button
                type="button"
                onClick={() => navigate(item.target)}
                className="shrink-0 p-2.5 rounded-lg bg-pastelPetal/10 hover:bg-pastelPetal/20 text-pastelPetal border border-pastelPetal/30 hover:border-pastelPetal/50 transition-all"
                title={t.actions.followUpQueue.execute}
              >
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border/50 text-xs flex items-center justify-between">
        <span className="text-foreground-secondary">{t.actions.followUpQueue.active}</span>
        <span className="text-emerald-400 font-bold font-mono">100% {t.actions.followUpQueue.onSchedule}</span>
      </div>
    </div>
  );
};

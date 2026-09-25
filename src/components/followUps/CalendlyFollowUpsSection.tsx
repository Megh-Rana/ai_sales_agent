import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Clock, 
  PhoneCall, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Zap, 
  MousePointerClick,
  Copy,
  Check,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { callService, CalendlyTrackingItem } from '../../services/callService';

export const CalendlyFollowUpsSection: React.FC = () => {
  const [trackings, setTrackings] = useState<CalendlyTrackingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTrackings = async () => {
    setLoading(true);
    try {
      const data = await callService.listCalendlyTrackings();
      setTrackings(data.items || []);
    } catch (err: any) {
      console.error('Failed to fetch Calendly trackings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackings();
    const interval = setInterval(fetchTrackings, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  const handleSimulateBooking = async (id: string, name: string) => {
    setActingId(id);
    try {
      await callService.simulateCalendlyBooking(id);
      toast.success(`Booking confirmed for ${name}!`, {
        description: 'Lead marked as meeting_booked. Future re-calls cancelled.',
      });
      await fetchTrackings();
    } catch (err: any) {
      toast.error('Simulation failed: ' + (err.message || 'Unknown error'));
    } finally {
      setActingId(null);
    }
  };

  const handleTriggerRecall = async (id: string, name: string) => {
    setActingId(id);
    try {
      const res = await callService.triggerCalendlyRecall(id);
      toast.success(`PSTN re-call dispatched to ${name}!`, {
        description: `Attempt ${res.retry_count || 1}/${res.max_retries || 3} active. Follow-up pitch delivered via Twilio.`,
      });
      await fetchTrackings();
    } catch (err: any) {
      toast.error('Re-call failed: ' + (err.message || 'Check Twilio credentials'));
    } finally {
      setActingId(null);
    }
  };

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Calendly booking link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatCountdown = (seconds: number) => {
    if (seconds <= 0) return 'Due for re-call';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m until auto-recall`;
  };

  const pendingCount = trackings.filter(t => t.status === 'pending' || t.status === 'recalled').length;
  const bookedCount = trackings.filter(t => t.status === 'booked').length;

  return (
    <div className="bg-surface-0 border border-border-default rounded-xl overflow-hidden shadow-xs mb-8">
      {/* Header */}
      <div className="p-5 md:p-6 border-b border-border-subtle bg-surface-1 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">
                Calendly Human-Transfer & Automated Re-call Engine
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30 font-semibold uppercase">
                24h Window Active
              </span>
            </div>
            <p className="text-xs text-foreground-secondary mt-0.5">
              When leads want to speak to a human during AI calls, a personalized Calendly link is texted via SMS. If unbooked after 24h, the AI automatically re-dials (up to 3 attempts).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-semibold">
              {pendingCount} Awaiting Booking
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold">
              {bookedCount} Booked
            </span>
          </div>

          <button
            onClick={fetchTrackings}
            disabled={loading}
            className="p-2 rounded-lg bg-surface-0 hover:bg-surface-2 border border-border-default text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh trackings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 md:p-6 bg-surface-0">
        {trackings.length === 0 ? (
          <div className="text-center py-10 bg-surface-1 border border-border-subtle rounded-xl">
            <Calendar className="w-10 h-10 text-foreground-tertiary mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-foreground mb-1">No Calendly Links Dispatched Yet</h4>
            <p className="text-xs text-foreground-secondary max-w-md mx-auto">
              During a live phone call or test call, when the lead says "I want to speak with a human", the AI will automatically send your Calendly booking link via SMS and monitor it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackings.map((t) => {
              const isBooked = t.status === 'booked';
              const isRecalled = t.status === 'recalled';
              const isExpired = t.status === 'expired';

              return (
                <div 
                  key={t.id}
                  className={`p-4 rounded-xl border transition-all shadow-xs ${
                    isBooked 
                      ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30'
                      : isRecalled
                      ? 'bg-blue-500/5 dark:bg-blue-950/20 border-blue-500/30'
                      : 'bg-surface-1 border-border-subtle hover:border-border-default'
                  }`}
                >
                  {/* Top Row: Lead & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{t.lead_name}</h4>
                      <p className="text-xs text-foreground-secondary">{t.company_name}</p>
                    </div>

                    {isBooked ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Booked
                      </span>
                    ) : isExpired ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-foreground-tertiary border border-border-subtle">
                        Max Retries
                      </span>
                    ) : isRecalled ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                        <PhoneCall className="w-3 h-3" />
                        Attempt {t.retry_count}/{t.max_retries}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        <Clock className="w-3 h-3" />
                        Awaiting
                      </span>
                    )}
                  </div>

                  {/* Phone & Link Click Status */}
                  <div className="space-y-1.5 py-2.5 my-2 border-y border-border-subtle text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground-tertiary">Phone:</span>
                      <span className="font-mono font-medium text-foreground">{t.phone_number}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-foreground-tertiary">Link Opened:</span>
                      <span className={`flex items-center gap-1 text-[11px] font-medium ${
                        t.link_clicked ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-foreground-tertiary'
                      }`}>
                        <MousePointerClick className="w-3 h-3" />
                        {t.link_clicked ? 'Yes (Clicked)' : 'Not clicked yet'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-foreground-tertiary">Invite Delivery:</span>
                      <span className="text-[11px] font-mono font-medium text-emerald-700 dark:text-emerald-400">
                        {t.email ? 'SMS + Email Sent' : 'SMS Sent'}
                      </span>
                    </div>

                    {t.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-foreground-tertiary">Email:</span>
                        <span className="font-mono text-[11px] text-foreground font-medium truncate max-w-[170px]" title={t.email}>
                          {t.email}
                        </span>
                      </div>
                    )}

                    {!isBooked && (
                      <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-medium">
                        <span>Re-call Window:</span>
                        <span className="text-[11px] font-mono font-semibold">
                          {formatCountdown(t.seconds_until_recall)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyLink(t.id, t.calendly_url)}
                        className="p-1.5 rounded-lg bg-surface-0 hover:bg-surface-2 border border-border-default text-foreground-secondary hover:text-foreground transition-colors"
                        title="Copy personalized Calendly URL"
                      >
                        {copiedId === t.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <a
                        href={t.calendly_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-surface-0 hover:bg-surface-2 border border-border-default text-foreground-secondary hover:text-foreground transition-colors"
                        title="Open booking link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isBooked && (
                        <>
                          <button
                            onClick={() => handleSimulateBooking(t.id, t.lead_name)}
                            disabled={actingId === t.id}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 transition-colors disabled:opacity-50"
                            title="Simulate Calendly booking (test conversion)"
                          >
                            Test Booked
                          </button>

                          <button
                            onClick={() => handleTriggerRecall(t.id, t.lead_name)}
                            disabled={actingId === t.id || isExpired}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1"
                            title="Trigger immediate follow-up re-call via PSTN"
                          >
                            <PhoneCall className="w-3 h-3" />
                            Re-call Now
                          </button>
                        </>
                      )}

                      {isBooked && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 py-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Retries Halted
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

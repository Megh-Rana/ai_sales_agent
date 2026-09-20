import React from 'react';
import {
  Radio,
  Cpu,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  Server,
  DollarSign,
  PhoneCall,
  Volume2
} from 'lucide-react';
import { VoiceUsageMetrics } from '../../types/admin';

interface AdminVoiceUsageTabProps {
  metrics: VoiceUsageMetrics;
}

export const AdminVoiceUsageTab: React.FC<AdminVoiceUsageTabProps> = ({ metrics }) => {
  return (
    <div className="space-y-6">
      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono uppercase text-foreground-tertiary">
              Voice Minutes This Month
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {metrics.totalVoiceMinutesMonth.toLocaleString()} <span className="text-xs font-mono text-foreground-tertiary">min</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">
            Across all outbound AI agents
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono uppercase text-foreground-tertiary">
              Total Roundtrip Latency
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {metrics.avgLatencyMs} <span className="text-xs font-mono text-foreground-tertiary">ms</span>
          </div>
          <p className="text-[11px] text-foreground-tertiary font-mono mt-1">
            Speech-to-Speech response interval
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono uppercase text-foreground-tertiary">
              Average Cost Per Call
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            ₹{metrics.costPerCallINR.toFixed(2)}
          </div>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">
            92% cheaper than human SDR calls
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono uppercase text-foreground-tertiary">
              Outbound Calls Today
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {metrics.totalCallsToday}
          </div>
          <p className="text-[11px] text-blue-400 font-mono mt-1">
            {metrics.activeLiveCalls} live sessions active
          </p>
        </div>
      </div>

      {/* Latency Pipeline Breakdown */}
      <div className="p-5 rounded-xl bg-surface-1 border border-border-default space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div>
            <h2 className="text-sm font-bold text-foreground">Sub-Second Conversational Latency Breakdown</h2>
            <p className="text-[11px] text-foreground-tertiary">
              Real-time profile of voice processing stages from prospect utterance to AI synthetic voice
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
            Ultra-Low Latency Mode Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
          {/* Stage 1: STT */}
          <div className="p-3.5 rounded-lg bg-surface-elevated border border-border-subtle space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">1. Speech-to-Text (STT)</span>
              <span className="font-mono text-emerald-400 font-bold">140 ms</span>
            </div>
            <p className="text-[10px] text-foreground-tertiary">
              Sarvam AI (Indian accents) with 4.5s fallback to local RTX 5050 Faster-Whisper.
            </p>
            <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: '48%' }} />
            </div>
          </div>

          {/* Stage 2: LLM Brain */}
          <div className="p-3.5 rounded-lg bg-surface-elevated border border-border-subtle space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">2. LLM Brain (Gemma-3)</span>
              <span className="font-mono text-purple-400 font-bold">16 ms / tok</span>
            </div>
            <p className="text-[10px] text-foreground-tertiary">
              99 GPU layers offloaded to CUDA RTX 5050. ~60 tok/sec generation rate.
            </p>
            <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-400 h-full rounded-full" style={{ width: '12%' }} />
            </div>
          </div>

          {/* Stage 3: Kokoro TTS */}
          <div className="p-3.5 rounded-lg bg-surface-elevated border border-border-subtle space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">3. TTS Synthesis (Kokoro)</span>
              <span className="font-mono text-blue-400 font-bold">95 ms</span>
            </div>
            <p className="text-[10px] text-foreground-tertiary">
              Sentence-chunked streaming synthesis directly piped into audio ring buffer.
            </p>
            <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-400 h-full rounded-full" style={{ width: '32%' }} />
            </div>
          </div>

          {/* Stage 4: SIP Telephony */}
          <div className="p-3.5 rounded-lg bg-surface-elevated border border-border-subtle space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">4. SIP Gateway</span>
              <span className="font-mono text-amber-400 font-bold">42 ms</span>
            </div>
            <p className="text-[10px] text-foreground-tertiary">
              Carrier SIP trunk jitter buffer & bidirectional audio streaming.
            </p>
            <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: '18%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Usage Bar Histogram */}
      <div className="p-5 rounded-xl bg-surface-1 border border-border-default space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Today's Voice Concurrency & Minute Distribution
            </h3>
            <p className="text-[11px] text-foreground-tertiary">
              Peak traffic between 10:00 AM – 4:00 PM IST during commercial business hours
            </p>
          </div>
          <span className="text-xs font-mono text-foreground-tertiary">
            Peak: 11 Concurrent Voice Lines
          </span>
        </div>

        <div className="grid grid-cols-8 gap-2 pt-2">
          {metrics.hourlyUsage.map((hour, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className="w-full bg-surface-2 h-28 rounded-lg flex items-end p-1">
                <div
                  className="w-full bg-primary/80 hover:bg-primary rounded transition-all group relative"
                  style={{ height: `${Math.min(100, Math.max(10, (hour.minutes / 165) * 100))}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-0 border border-border-default px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-md pointer-events-none z-10">
                    {hour.minutes} min ({hour.concurrentCalls} calls)
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-foreground-tertiary">{hour.hour}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

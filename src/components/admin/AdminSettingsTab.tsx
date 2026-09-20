import React, { useState } from 'react';
import {
  Sliders,
  Cpu,
  Radio,
  ShieldCheck,
  Database,
  CheckCircle2,
  Save,
  Zap,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { PlatformConfig } from '../../types/admin';
import { toast } from 'sonner';

interface AdminSettingsTabProps {
  config: PlatformConfig;
  onSaveConfig: (config: PlatformConfig) => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({ config, onSaveConfig }) => {
  const [form, setForm] = useState<PlatformConfig>({ ...config });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onSaveConfig(form);
      setIsSaving(false);
      toast.success('Platform operational configuration updated & persisted successfully!');
    }, 400);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI Inference & GPU Settings */}
      <div className="p-5 rounded-xl bg-surface-1 border border-border-default space-y-4">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">AI Intelligence & Hardware Acceleration</h2>
            <p className="text-[11px] text-foreground-tertiary">
              Configure LLM reasoning engine, CUDA GPU offload layers, and conversational speed thresholds
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-foreground-secondary font-medium mb-1">
              Active LLM Engine Model
            </label>
            <select
              value={form.activeLlmModel}
              onChange={(e) => setForm({ ...form, activeLlmModel: e.target.value })}
              className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-xs cursor-pointer"
            >
              <option value="gemma3:4b (Local RTX 5050 CUDA Offload)">
                gemma3:4b (RTX 5050 CUDA GPU Offload - ~16ms/tok)
              </option>
              <option value="llama3.3:70b-instruct-q4">
                llama3.3:70b-instruct-q4 (Cloud Cluster)
              </option>
              <option value="sarvam-2b-v0.5">
                sarvam-2b-v0.5 (Indian Multilingual Specialized)
              </option>
            </select>
            <span className="text-[10px] text-foreground-tertiary mt-1 block">
              Directly queried by backend/ai/brain.py via Ollama API
            </span>
          </div>

          <div>
            <label className="block text-foreground-secondary font-medium mb-1">
              GPU Layers Offload ({form.gpuLayers} layers)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={99}
                value={form.gpuLayers}
                onChange={(e) => setForm({ ...form, gpuLayers: Number(e.target.value) })}
                className="flex-1 accent-primary cursor-pointer"
              />
              <span className="font-mono font-bold text-xs text-primary min-w-[32px]">
                {form.gpuLayers} L
              </span>
            </div>
            <span className="text-[10px] text-foreground-tertiary mt-1 block">
              Configured via OLLAMA_NUM_GPU in backend/config.py
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border-subtle text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.whisperGpuWarm}
              onChange={(e) => setForm({ ...form, whisperGpuWarm: e.target.checked })}
              className="rounded border-border-default text-primary focus:ring-primary h-4 w-4 bg-surface-elevated cursor-pointer"
            />
            <span className="text-foreground font-medium">
              Pre-warm faster-whisper GPU weights on server startup (Eliminates 1.5s cold start)
            </span>
          </label>
        </div>
      </div>

      {/* Telephony & STT Pipeline */}
      <div className="p-5 rounded-xl bg-surface-1 border border-border-default space-y-4">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Speech-to-Text & Concurrency Limits</h2>
            <p className="text-[11px] text-foreground-tertiary">
              Manage Sarvam STT cloud timeouts, fallback logic, and maximum concurrent lines
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-foreground-secondary font-medium mb-1">
              Sarvam Cloud STT Timeout Threshold ({form.sarvamSttTimeoutSeconds}s)
            </label>
            <input
              type="number"
              step={0.5}
              min={1.0}
              max={15.0}
              value={form.sarvamSttTimeoutSeconds}
              onChange={(e) => setForm({ ...form, sarvamSttTimeoutSeconds: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-xs"
            />
            <span className="text-[10px] text-foreground-tertiary mt-1 block">
              If cloud exceeds this threshold, instant fallback to CUDA Whisper activates.
            </span>
          </div>

          <div>
            <label className="block text-foreground-secondary font-medium mb-1">
              Max Global Concurrent Voice Lines ({form.maxConcurrentCallsGlobal} calls)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.maxConcurrentCallsGlobal}
              onChange={(e) => setForm({ ...form, maxConcurrentCallsGlobal: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-xs"
            />
            <span className="text-[10px] text-foreground-tertiary mt-1 block">
              Safeguard limit to prevent SIP channel saturation and voice degradation.
            </span>
          </div>
        </div>
      </div>

      {/* Security & Audit Policies */}
      <div className="p-5 rounded-xl bg-surface-1 border border-border-default space-y-4">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Security, Fraud & Compliance Policies</h2>
            <p className="text-[11px] text-foreground-tertiary">
              Automatic abuse protection, audit log retention, and lead quality gates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-foreground-secondary font-medium mb-1">
              Immutable Audit Log Retention Period
            </label>
            <select
              value={form.auditRetentionDays}
              onChange={(e) => setForm({ ...form, auditRetentionDays: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-xs cursor-pointer"
            >
              <option value={30}>30 Days (Standard Audit Trail)</option>
              <option value={90}>90 Days (Recommended Enterprise Standard)</option>
              <option value={365}>365 Days (SOC2 & ISO Compliance Tier)</option>
            </select>
          </div>

          <div>
            <label className="block text-foreground-secondary font-medium mb-1">
              Lead Intent Quality Minimum Gate ({form.leadQualityThreshold} / 100)
            </label>
            <input
              type="number"
              min={50}
              max={95}
              value={form.leadQualityThreshold}
              onChange={(e) => setForm({ ...form, leadQualityThreshold: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-xs"
            />
            <span className="text-[10px] text-foreground-tertiary mt-1 block">
              Leads below this score are prevented from automated mass voice enrollment.
            </span>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
            <input
              type="checkbox"
              checked={form.autoFraudShieldActive}
              onChange={(e) => setForm({ ...form, autoFraudShieldActive: e.target.checked })}
              className="rounded border-border-default text-primary focus:ring-primary h-4 w-4 bg-surface-elevated cursor-pointer"
            />
            <span className="text-foreground font-medium">
              Enable Autonomous Fraud Shield (Auto-mitigate rapid redialing & credential stuffing)
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSaving}
          leftIcon={<Save className="w-4 h-4" />}
          className="font-semibold shadow-xs text-xs px-5"
        >
          {isSaving ? 'Persisting Configuration...' : 'Save & Deploy Configuration'}
        </Button>
      </div>
    </form>
  );
};

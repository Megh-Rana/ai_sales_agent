import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, AlertTriangle, CheckCircle2, Zap, ShieldCheck, RefreshCw, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface FraudAnomaly {
  id: string;
  business_id: string;
  account_name: string;
  event_type: string;
  severity: 'WARNING' | 'CRITICAL';
  detected_at: string;
  calls_in_window: number;
  window_minutes: number;
  threshold: number;
  description: string;
  status: string;
  recommended_action: string;
}

export const AdminFraud: React.FC = () => {
  const { token } = useAuth();
  const [anomalies, setAnomalies] = useState<FraudAnomaly[]>([
    {
      id: 'anom-01',
      business_id: 'b-991',
      account_name: 'Apex Automated Logistics',
      event_type: 'HIGH_FREQUENCY_CALL_SPIKE',
      severity: 'CRITICAL',
      detected_at: new Date(Date.now() - 180000).toISOString(),
      calls_in_window: 48,
      window_minutes: 5,
      threshold: 15,
      description: 'Abnormal outbound surge: 48 calls initiated in 5 minutes (320% above baseline).',
      status: 'FLAGGED_FOR_REVIEW',
      recommended_action: 'Throttle active outbound queue & request MFA confirmation',
    },
    {
      id: 'anom-02',
      business_id: 'b-992',
      account_name: 'RapidLead Telemarketing',
      event_type: 'RAPID_CONCURRENT_DIALS',
      severity: 'WARNING',
      detected_at: new Date(Date.now() - 600000).toISOString(),
      calls_in_window: 22,
      window_minutes: 10,
      threshold: 15,
      description: 'Concurrent channel burst: 22 calls within a 10-minute window.',
      status: 'FLAGGED_FOR_REVIEW',
      recommended_action: 'Verify account API key origin and monitor completion rate',
    },
  ]);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleSimulateSpike = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/fraud/simulate-spike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          business_id: '22222222-2222-2222-2222-222222222222',
          call_count: 35,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.anomalies_detected && result.anomalies_detected.length > 0) {
          setAnomalies((prev) => [...result.anomalies_detected, ...prev]);
        }
      }
    } catch {
      // Local fallback
      const mockSpike: FraudAnomaly = {
        id: `anom-sim-${Date.now()}`,
        business_id: '22222222-2222-2222-2222-222222222222',
        account_name: 'Futurrizon Technologies (Simulated)',
        event_type: 'SIMULATED_HIGH_FREQUENCY_SPIKE',
        severity: 'CRITICAL',
        detected_at: new Date().toISOString(),
        calls_in_window: 35,
        window_minutes: 5,
        threshold: 15,
        description: 'Simulated high-frequency call surge: 35 outbound calls in under 5 minutes.',
        status: 'FLAGGED_FOR_REVIEW',
        recommended_action: 'Automated throttle invoked. Flagged for administrative verification.',
      };
      setAnomalies((prev) => [mockSpike, ...prev]);
    } finally {
      setIsSimulating(false);
      setSimulationNotice('Call volume spike simulated: Fraud detection sentinel triggered and account flagged.');
      setTimeout(() => setSimulationNotice(null), 5000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-h1 font-bold text-foreground tracking-tight">Fraud & Anomaly Sentinel</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-signal-urgent/15 text-signal-urgent border border-signal-urgent/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              Real-Time Abuse Detection
            </span>
          </div>
          <p className="text-body text-foreground-secondary">
            Continuous threat analysis: flags accounts initiating abnormal call surges or rapid concurrent bursts.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleSimulateSpike}
          isLoading={isSimulating}
          leftIcon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
        >
          Simulate Call Volume Spike
        </Button>
      </div>

      {simulationNotice && (
        <div className="p-3.5 rounded-xl bg-signal-urgent/10 border border-signal-urgent/30 text-xs text-signal-urgent flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{simulationNotice}</span>
        </div>
      )}

      {/* Flagged Anomalies Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            Flagged Security Anomalies ({anomalies.length})
          </h2>
          <span className="text-[11px] font-mono text-foreground-tertiary">
            Threshold: &gt;15 calls / 10m
          </span>
        </div>

        <div className="space-y-3">
          {anomalies.map((anom) => (
            <div
              key={anom.id}
              className={`p-4 rounded-xl border transition-all ${
                anom.severity === 'CRITICAL'
                  ? 'bg-surface-0 border-signal-urgent/40 shadow-xs'
                  : 'bg-surface-0 border-amber-500/30'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{anom.account_name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        anom.severity === 'CRITICAL'
                          ? 'bg-signal-urgent/20 text-signal-urgent border border-signal-urgent/40'
                          : 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                      }`}
                    >
                      {anom.severity}
                    </span>
                    <span className="text-[11px] font-mono text-foreground-tertiary">
                      {new Date(anom.detected_at).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-xs text-foreground-secondary">{anom.description}</p>

                  <div className="text-[11px] text-primary font-medium flex items-center gap-1.5">
                    <span>Mitigation:</span>
                    <span>{anom.recommended_action}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-signal-urgent/10 text-signal-urgent border border-signal-urgent/20">
                    Flagged for Review
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AdminFraud;

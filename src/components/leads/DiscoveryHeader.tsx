import React from 'react';
import { RefreshCw, Radio } from 'lucide-react';
import { Button } from '../ui/Button';
import { useI18n } from '../../i18n/i18nContext';

export interface DiscoveryHeaderProps {
  totalFeeds?: number;
  lastScannedAt?: string;
  onRescan: () => void;
  isScanning?: boolean;
  className?: string;
}

export const DiscoveryHeader: React.FC<DiscoveryHeaderProps> = ({
  totalFeeds = 42,
  lastScannedAt = '4 minutes ago',
  onRescan,
  isScanning = false,
  className = '',
}) => {
  const { t } = useI18n();

  return (
    <div
      className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle ${className}`}
    >
      {/* Title & Live Status */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-h1 font-bold text-foreground tracking-tight">
            {t.leadDiscovery?.title || 'Commercial Intent Discovery'}
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-signal-qualified-muted text-signal-qualified border border-signal-qualified/30">
            <Radio className="w-3 h-3 text-signal-qualified" />
            {totalFeeds} {t.leadDiscovery?.telemetryActive || 'Telemetry Feeds Active'}
          </span>
        </div>
        <p className="text-body text-foreground-secondary flex items-center gap-2">
          <span>{t.leadDiscovery?.subtitle || 'Find businesses currently expressing active commercial buying demand.'}</span>
          <span className="text-foreground-tertiary hidden sm:inline-block">·</span>
          <span className="text-[11px] font-mono text-foreground-tertiary hidden sm:inline-block">
            {t.leadDiscovery?.lastScan || 'Last scan updated'} {lastScannedAt}
          </span>
        </p>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={onRescan}
          isLoading={isScanning}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />}
        >
          {isScanning ? (t.leadDiscovery?.scanning || 'Scanning Feeds...') : (t.leadDiscovery?.rescan || 'Re-scan Feeds')}
        </Button>
      </div>
    </div>
  );
};

import React from 'react';
import { ExternalLink, Globe, Briefcase, DollarSign, Cpu, Twitter, Building2, FileText, Sparkles } from 'lucide-react';
import { SignalSource } from '../../types/sales';
import { getResolvableSourceUrl } from '../../utils/sourceUrl';

export interface SignalSourceBadgeProps {
  source: SignalSource;
  className?: string;
  companyName?: string;
  companyDomain?: string;
  requirement?: string;
}

export const SignalSourceBadge: React.FC<SignalSourceBadgeProps> = ({
  source,
  className = '',
  companyName,
  companyDomain,
  requirement,
}) => {
  const getIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('twitter') || p.includes('x (')) return <Twitter className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    if (p.includes('company') || p.includes('website')) return <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    if (p.includes('rfp') || p.includes('bidding') || p.includes('tender')) return <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    if (p.includes('hiring') || p.includes('inferred')) return <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    if (p.includes('job') || p.includes('freelance') || p.includes('linkedin')) return <Briefcase className="w-3.5 h-3.5 text-info shrink-0" />;
    if (p.includes('funding') || p.includes('crunchbase') || p.includes('invest')) return <DollarSign className="w-3.5 h-3.5 text-signal-qualified shrink-0" />;
    if (p.includes('tech') || p.includes('stack') || p.includes('github')) return <Cpu className="w-3.5 h-3.5 text-signal-high shrink-0" />;
    return <Globe className="w-3.5 h-3.5 text-foreground-tertiary shrink-0" />;
  };

  const resolvableUrl = getResolvableSourceUrl(
    source.sourceUrl,
    source.platform,
    companyName,
    companyDomain,
    requirement || source.originalRequirement
  );

  return (
    <div className={`inline-flex flex-wrap items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-surface-subtle border border-border-subtle rounded-md text-xs text-foreground-secondary min-w-0 max-w-full ${className}`}>
      <span className="shrink-0">{getIcon(source.platform)}</span>
      <span className="font-semibold text-foreground shrink-0">{source.platform}</span>
      <span className="text-foreground-tertiary font-mono text-[11px] shrink-0">· {source.discoveredAt}</span>
      {resolvableUrl && (
        <a
          href={resolvableUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-medium shrink-0 transition-colors ml-0.5"
          title={`View original source on ${source.platform}`}
        >
          <span>View Source</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      )}
    </div>
  );
};


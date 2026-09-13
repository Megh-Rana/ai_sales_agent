import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return (
      <div className="flex items-center gap-2 text-body-medium font-semibold text-foreground">
        <span>Overview Dashboard</span>
      </div>
    );
  }

  const formatSegment = (segment: string, fullPath: string) => {
    // Route segment friendly labels
    const dictionary: Record<string, string> = {
      leads: 'Opportunities',
      discover: 'Discover Intent Signals',
      campaigns: 'Outreach Cadences',
      calls: 'AI Voice Calls',
      'follow-ups': 'Follow-ups Queue',
      analytics: 'Pipeline Velocity',
      business: 'Business Profile',
      settings: 'Settings',
      profile: 'User Profile',
      team: 'Team & Seats',
      notifications: 'Notification Channels',
      subscription: 'Subscription & Billing',
      security: 'Security & SSO',
      admin: 'Administration',
      users: 'User Governance',
      'voice-usage': 'AI Voice Telemetry',
      'audit-logs': 'System Audit Logs',
      fraud: 'Fraud & Anomalies',
    };

    if (dictionary[segment]) {
      return dictionary[segment];
    }

    // Param IDs handling
    if (segment.startsWith('opp-') || segment.startsWith('lead-')) {
      if (segment === 'opp-101' || segment === 'lead-1') return 'Acme Technologies';
      if (segment === 'opp-102') return 'CloudScale Systems';
      if (segment === 'opp-103') return 'Nexus Health AI';
      return 'Account Intel Profile';
    }

    if (segment.startsWith('cmp-')) {
      if (segment === 'cmp-201') return 'Q4 SaaS Outreach';
      if (segment === 'cmp-202') return 'Mid-Market Cadence';
      return 'Cadence Workflow';
    }

    if (segment.startsWith('call-')) {
      if (segment === 'call-101') return 'Sarah Jenkins (VP Ops)';
      return 'Live Voice Session';
    }

    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-foreground-tertiary select-none">
      <Link
        to="/dashboard"
        className="hover:text-foreground flex items-center gap-1 transition-colors p-1 -m-1 rounded"
        title="Dashboard"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const formatted = formatSegment(value, to);

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-foreground truncate max-w-[160px] sm:max-w-[240px]">
                {formatted}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-[180px]"
              >
                {formatted}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

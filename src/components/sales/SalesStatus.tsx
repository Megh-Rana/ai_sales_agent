import React from 'react';
import { SalesStatusType } from '../../types/sales';
import { Badge, BadgeVariant } from '../ui/Badge';

export interface SalesStatusProps {
  status: SalesStatusType;
  className?: string;
}

export const SalesStatus: React.FC<SalesStatusProps> = ({ status, className }) => {
  const statusMap: Record<SalesStatusType, { label: string; variant: BadgeVariant; pulse?: boolean }> = {
    discovered: { label: 'Discovered', variant: 'discovered' },
    'high-intent': { label: 'High Intent', variant: 'high-intent', pulse: true },
    qualified: { label: 'Qualified', variant: 'qualified' },
    contacted: { label: 'Contacted', variant: 'info' },
    interested: { label: 'Interested', variant: 'qualified' },
    meeting: { label: 'Meeting Scheduled', variant: 'qualified', pulse: true },
    won: { label: 'Closed Won', variant: 'qualified' },
    lost: { label: 'Closed Lost', variant: 'neutral' },
    'follow-up': { label: 'Follow-Up Needed', variant: 'follow-up' },
  };

  const config = statusMap[status] || { label: status, variant: 'neutral' as BadgeVariant };

  return (
    <Badge variant={config.variant} pulse={config.pulse} leftDot className={className}>
      {config.label}
    </Badge>
  );
};

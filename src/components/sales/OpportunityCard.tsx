import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Building2, PhoneCall, ExternalLink } from 'lucide-react';
import { Opportunity } from '../../types/sales';
import { IntentScore } from './IntentScore';
import { SalesStatus } from './SalesStatus';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

export interface OpportunityCardProps {
  opportunity: Opportunity;
  onSelect?: (opp: Opportunity) => void;
  onAction?: (opp: Opportunity) => void;
  isSelected?: boolean;
  className?: string;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onSelect,
  onAction,
  isSelected = false,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={() => onSelect && onSelect(opportunity)}
      className={`bg-surface-0 border rounded-xl p-5 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-primary shadow-glow-blue bg-surface-1'
          : 'border-border-default hover:border-border-hover hover:bg-surface-hover/60'
      } ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Company & Core Info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <Avatar type="company" name={opportunity.companyName} size="lg" />

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-h3 font-semibold text-foreground truncate">
                {opportunity.companyName}
              </h3>
              <SalesStatus status={opportunity.salesStatus} />
            </div>

            <p className="text-body text-foreground-secondary line-clamp-2">
              {opportunity.requirement}
            </p>

            <div className="flex items-center gap-4 text-caption text-foreground-tertiary pt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {opportunity.industry}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {opportunity.location}
              </span>
              <span className="font-mono font-medium text-signal-qualified">
                Pipeline Value: {opportunity.estimatedValue}
              </span>
            </div>
          </div>
        </div>

        {/* Intent Score & Action CTA */}
        <div className="flex items-center gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border-subtle">
          <IntentScore score={opportunity.intentScore} level={opportunity.intentLevel} expandable={false} />

          <div className="shrink-0">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PhoneCall className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                if (onAction) onAction(opportunity);
              }}
            >
              AI Call
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

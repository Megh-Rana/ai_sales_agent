import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { Tooltip } from '../ui/Tooltip';

export interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string | number;
  badgeVariant?: 'primary' | 'signal' | 'neutral';
  isCollapsed?: boolean;
  onClick?: () => void;
  subItem?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  to,
  icon,
  label,
  badge,
  badgeVariant = 'primary',
  isCollapsed = false,
  onClick,
  subItem = false,
}) => {
  const content = (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'group relative flex items-center gap-3 px-3 py-2 text-body-medium rounded-md transition-all duration-150 select-none',
          subItem && 'pl-9 text-xs',
          isActive
            ? 'bg-primary-muted text-primary font-semibold border-l-2 border-primary -ml-[2px]'
            : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover/80',
          isCollapsed && 'justify-center px-2'
        )
      }
    >
      <span className="shrink-0 text-current">{icon}</span>

      {!isCollapsed && <span className="truncate flex-1">{label}</span>}

      {!isCollapsed && badge !== undefined && (
        <span
          className={clsx(
            'px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full shrink-0',
            badgeVariant === 'signal'
              ? 'bg-signal-high-muted text-signal-high'
              : badgeVariant === 'primary'
              ? 'bg-primary-muted text-primary'
              : 'bg-surface-elevated text-foreground-tertiary'
          )}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );

  if (isCollapsed) {
    return (
      <Tooltip content={label} position="right">
        {content}
      </Tooltip>
    );
  }

  return content;
};

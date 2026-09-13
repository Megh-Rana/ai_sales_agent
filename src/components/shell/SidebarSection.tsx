import React from 'react';

export interface SidebarSectionProps {
  label?: string;
  isCollapsed?: boolean;
  children: React.ReactNode;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({ label, isCollapsed = false, children }) => {
  return (
    <div className="space-y-1 py-1.5">
      {label && !isCollapsed && (
        <div className="px-3 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-foreground-tertiary">
          {label}
        </div>
      )}
      {children}
    </div>
  );
};

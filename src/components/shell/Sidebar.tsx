import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Compass,
  Target,
  PhoneCall,
  CalendarCheck,
  BarChart3,
  Radar,
  Activity,
  Sparkles,
  Briefcase,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { SidebarSection } from './SidebarSection';
import { SidebarItem } from './SidebarItem';
import { Avatar } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';
import { mockUser } from '../../services/mockShellData';

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  className = '',
}) => {
  return (
    <aside
      className={`bg-surface border-r border-border-strong h-screen flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${className}`}
    >
      {/* Product Identity Header */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between shrink-0 h-16">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2.5 min-w-0 group"
          title="Vidur - AI Sales Platform"
        >
          {/* Restrained Geometric Vidur Brand Aperture */}
          <div className="w-8 h-8 rounded-lg bg-surface-1 border border-primary/40 flex items-center justify-center text-primary shrink-0 shadow-xs group-hover:border-primary transition-colors">
            <svg
              className="w-4 h-4 text-primary transition-transform group-hover:scale-105"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4l8 16 8-16" />
              <path d="M8 4l4 8 4-8" />
            </svg>
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-h4 font-bold text-foreground tracking-tight flex items-center gap-1.5 leading-none">
                <span>Vidur</span>
                <span className="text-[10px] font-mono uppercase bg-primary-muted text-primary px-1.5 py-0.2 rounded border border-primary/30 font-semibold">
                  OS
                </span>
              </div>
              <div className="text-[11px] text-foreground-tertiary truncate mt-0.5">AI Sales Platform</div>
            </div>
          )}
        </NavLink>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 text-foreground-tertiary hover:text-foreground hover:bg-surface-hover rounded-md transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Workspace Switcher */}
      <WorkspaceSwitcher isCollapsed={isCollapsed} />

      {/* Navigation Links Area */}
      <nav aria-label="Main Navigation" className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {/* OVERVIEW */}
        <SidebarSection label="Overview" isCollapsed={isCollapsed}>
          <SidebarItem
            to="/dashboard"
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Dashboard"
            isCollapsed={isCollapsed}
          />
        </SidebarSection>

        {/* SALES WORKFLOW */}
        <SidebarSection label="Sales Operations" isCollapsed={isCollapsed}>
          <SidebarItem
            to="/command-center"
            icon={<Activity className="w-4 h-4" />}
            label="Revenue Command Center"
            badge="Live OS"
            badgeVariant="primary"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            to="/opportunities"
            icon={<Radar className="w-4 h-4" />}
            label="Opportunity Radar"
            badge="7 Active"
            badgeVariant="signal"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            to="/leads"
            icon={<Users className="w-4 h-4" />}
            label="Leads & Accounts"
            badge="38"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            to="/leads/discover"
            icon={<Compass className="w-4 h-4" />}
            label="Discover Intent Signals"
            isCollapsed={isCollapsed}
            subItem={!isCollapsed}
          />
          <SidebarItem
            to="/campaigns"
            icon={<Target className="w-4 h-4" />}
            label="Outreach Cadences"
            badge="4 Active"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            to="/calls"
            icon={<PhoneCall className="w-4 h-4" />}
            label="AI Voice Agent Calls"
            badge="Live"
            badgeVariant="primary"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            to="/follow-ups"
            icon={<CalendarCheck className="w-4 h-4" />}
            label="Follow-ups Queue"
            badge="12"
            isCollapsed={isCollapsed}
          />
        </SidebarSection>

        {/* INTELLIGENCE */}
        <SidebarSection label="Intelligence" isCollapsed={isCollapsed}>
          <SidebarItem
            to="/copilot"
            icon={<Sparkles className="w-4 h-4" />}
            label="Sales Copilot"
            badge="AI Pitch"
            badgeVariant="primary"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            to="/actions"
            icon={<Target className="w-4 h-4 text-blue-400" />}
            label="Sales Action Center"
            badge="4 Urgent"
            badgeVariant="signal"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            to="/analytics"
            icon={<BarChart3 className="w-4 h-4" />}
            label="Pipeline Analytics"
            isCollapsed={isCollapsed}
          />
        </SidebarSection>

        {/* WORKSPACE */}
        <SidebarSection label="Workspace" isCollapsed={isCollapsed}>
          <SidebarItem
            to="/business"
            icon={<Briefcase className="w-4 h-4" />}
            label="Business Profile"
            isCollapsed={isCollapsed}
          />
        </SidebarSection>

        {/* ADMINISTRATION */}
        <SidebarSection label="Administration" isCollapsed={isCollapsed}>
          <SidebarItem
            to="/admin"
            icon={<ShieldAlert className="w-4 h-4" />}
            label="Admin Portal"
            isCollapsed={isCollapsed}
          />
        </SidebarSection>
      </nav>

      {/* Footer Area: Settings & User Profile */}
      <div className="p-3 border-t border-border bg-surface shrink-0">
        <SidebarItem
          to="/settings"
          icon={<Settings className="w-4 h-4" />}
          label="Settings"
          isCollapsed={isCollapsed}
        />
      </div>
    </aside>
  );
};

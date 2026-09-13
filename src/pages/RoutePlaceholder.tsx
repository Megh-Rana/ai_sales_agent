import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Bot, ShieldCheck, Sun, Moon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';

function SettingsThemePanel() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-5 bg-surface rounded-xl border border-border-strong space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-h4 font-semibold text-foreground">Global Appearance Theme</h3>
          <p className="text-caption text-foreground-secondary mt-0.5">
            Select your preferred visual environment for long working sessions. Preference is saved automatically.
          </p>
        </div>
        <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-primary-muted text-primary border border-primary/30">
          {theme === 'light' ? '☀ Day Mode Active' : '🌙 Night Mode Active'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all ${
            theme === 'light'
              ? 'bg-surface-elevated border-primary ring-2 ring-primary/20 shadow-sm'
              : 'bg-surface-muted border-border hover:border-border-strong hover:bg-surface-hover'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="text-small font-bold text-foreground">Day Mode (Light)</div>
            <div className="text-caption text-foreground-tertiary">Soft neutral paper workspace for bright environments.</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all ${
            theme === 'dark'
              ? 'bg-surface-elevated border-primary ring-2 ring-primary/20 shadow-sm'
              : 'bg-surface-muted border-border hover:border-border-strong hover:bg-surface-hover'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-small font-bold text-foreground">Night Mode (Dark)</div>
            <div className="text-caption text-foreground-tertiary">Calm charcoal graphite theme for low-light focus.</div>
          </div>
        </button>
      </div>
    </div>
  );
}

export interface RoutePlaceholderProps {
  title?: string;
  description?: string;
  badge?: string;
}

export const RoutePlaceholder: React.FC<RoutePlaceholderProps> = ({
  title,
  description,
  badge = 'Pipeline Route Shell Active',
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname.replace(/^\//, '');
    if (!path) return 'Dashboard Overview';
    return path
      .split('/')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '))
      .join(' / ');
  };

  const getPageDescription = () => {
    if (description) return description;
    return `This structural route (${location.pathname}) is mounted in the Vidur App Shell architecture. Autonomous sales agent workflows and data models will connect here.`;
  };

  return (
    <div className="bg-surface-0 border border-border-default rounded-xl p-6 sm:p-10 space-y-6 shadow-sm">
      {/* Route Header Badge & Path */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2 py-0.5 rounded bg-primary-muted text-primary text-xs font-mono font-bold uppercase border border-primary/30">
          {badge}
        </span>
        <span className="text-caption font-mono text-foreground-tertiary bg-surface-1 px-2 py-0.5 rounded border border-border-subtle">
          {location.pathname}
        </span>
      </div>

      {/* Title & Description */}
      <div className="space-y-2">
        <h1 className="text-h1 font-bold text-foreground tracking-tight">{getPageTitle()}</h1>
        <p className="text-body text-foreground-secondary max-w-3xl leading-relaxed">{getPageDescription()}</p>
      </div>

      {/* Settings Theme Selection Panel when on Settings route */}
      {location.pathname.startsWith('/settings') && (
        <SettingsThemePanel />
      )}

      {/* Structural Capability Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border-subtle">
        <div className="p-4 bg-surface-1 rounded-lg border border-border-subtle space-y-1.5">
          <div className="flex items-center gap-2 text-small font-semibold text-foreground">
            <Zap className="w-4 h-4 text-signal-high shrink-0" />
            <span>Intent Detection Engine</span>
          </div>
          <p className="text-caption text-foreground-secondary leading-normal">
            Real-time trigger monitoring connected to workspace signal feeds.
          </p>
        </div>

        <div className="p-4 bg-surface-1 rounded-lg border border-border-subtle space-y-1.5">
          <div className="flex items-center gap-2 text-small font-semibold text-foreground">
            <Bot className="w-4 h-4 text-primary shrink-0" />
            <span>Autonomous Sales Agent</span>
          </div>
          <p className="text-caption text-foreground-secondary leading-normal">
            Voice agent dispatch, pitch brief synthesis, and qualification scorecard ready.
          </p>
        </div>

        <div className="p-4 bg-surface-1 rounded-lg border border-border-subtle space-y-1.5">
          <div className="flex items-center gap-2 text-small font-semibold text-foreground">
            <ShieldCheck className="w-4 h-4 text-signal-qualified shrink-0" />
            <span>Enterprise RBAC</span>
          </div>
          <p className="text-caption text-foreground-secondary leading-normal">
            Strict workspace isolation and immutable audit logging enforced.
          </p>
        </div>
      </div>

      {/* Navigation and Actions */}
      <div className="pt-2 flex flex-wrap items-center gap-3">
        {location.pathname === '/business' && (
          <Link to="/business/onboarding">
            <Button variant="primary" size="md">
              Configure Sales Agent (Onboarding)
            </Button>
          </Link>
        )}
        <Link to="/dashboard">
          <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
        <Link to="/leads">
          <Button variant="ghost" size="md">
            View Opportunities
          </Button>
        </Link>
      </div>
    </div>
  );
};

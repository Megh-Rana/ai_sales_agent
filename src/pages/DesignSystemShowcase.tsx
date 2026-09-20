import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import {
  Sparkles,
  PhoneCall,
  Search,
  Zap,
  Plus,
  SlidersHorizontal,
  Bell,
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';
import { Tooltip } from '../components/ui/Tooltip';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { Tabs } from '../components/ui/Tabs';
import { Avatar } from '../components/ui/Avatar';

import { IntentScore } from '../components/sales/IntentScore';
import { SalesStatus } from '../components/sales/SalesStatus';
import { OpportunityCard } from '../components/sales/OpportunityCard';
import { NextBestAction } from '../components/sales/NextBestAction';
import { QualificationMatrix } from '../components/sales/QualificationMatrix';
import { SignalSourceBadge } from '../components/sales/SignalSourceBadge';

import { AIStatus } from '../components/ai/AIStatus';
import { AISalesBrief } from '../components/ai/AISalesBrief';
import { AIProcessing } from '../components/ai/AIProcessing';
import { IntentDetectionAnimation } from '../components/ai/IntentDetectionAnimation';

import { Metric } from '../components/data/Metric';
import { DataTable } from '../components/data/DataTable';
import { ActivityTimeline } from '../components/data/ActivityTimeline';

import { EmptyState } from '../components/feedback/EmptyState';
import { CardSkeleton, MetricSkeleton } from '../components/feedback/Skeleton';
import { ErrorState } from '../components/feedback/ErrorState';

import { Opportunity } from '../types/sales';

export const DesignSystemShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('primitives');
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  const sampleOpp: Opportunity = {
    id: 'opp-101',
    companyName: 'Acme Software Labs',
    industry: 'Enterprise SaaS',
    requirement: 'Urgent hiring post for 4 Sales Operations Managers to build outbound cadences',
    location: 'San Francisco, CA',
    intentScore: 94,
    intentLevel: 'high',
    estimatedValue: '₹18.4L ARR',
    salesStatus: 'high-intent',
    buyingSignals: [
      { id: '1', type: 'Hiring', description: 'Urgent Sales Ops hiring post', timestamp: '24h ago', impactScore: 95 },
      { id: '2', type: 'Tech Stack', description: 'Migrated off legacy CRM', timestamp: '48h ago', impactScore: 90 },
    ],
    signalSource: {
      platform: 'LinkedIn Hiring Feed',
      discoveredAt: '10:42 AM Today',
      originalRequirement: 'Looking for outbound automation tooling',
      sourceUrl: 'https://linkedin.com',
    },
  };

  const sampleTableData = [
    { id: '1', company: 'Acme Software', intent: 94, status: 'high-intent' as const, value: '₹18.4L' },
    { id: '2', company: 'Nexus FinTech', intent: 88, status: 'qualified' as const, value: '₹24.0L' },
    { id: '3', company: 'CloudScale Inc', intent: 72, status: 'contacted' as const, value: '₹12.5L' },
    { id: '4', company: 'HyperGrow AI', intent: 91, status: 'meeting' as const, value: '₹32.0L' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 max-w-7xl mx-auto space-y-10">
      <Toaster position="top-right" theme="dark" />

      {/* Showcase Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-primary-muted text-primary text-xs font-mono font-bold uppercase">
              Design System Showcase
            </span>
            <span className="text-caption font-mono text-foreground-tertiary">Internal QA & Token Visualizer</span>
          </div>
          <h1 className="text-display font-bold text-foreground">Vidur UI Specification</h1>
          <p className="text-body text-foreground-secondary mt-1">
            Enterprise B2B AI Sales Operating System Component Foundation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={() => setDrawerOpen(true)}>
            View Drawer
          </Button>
          <Button variant="primary" size="md" leftIcon={<Zap className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            Test Modal
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        tabs={[
          { id: 'primitives', label: 'UI Primitives', icon: <Layers className="w-4 h-4" /> },
          { id: 'sales', label: 'Sales Intelligence', icon: <Zap className="w-4 h-4" /> },
          { id: 'ai', label: 'AI Activity & Briefs', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'data', label: 'Data & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'feedback', label: 'System Feedback', icon: <FileText className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: UI PRIMITIVES */}
      {activeTab === 'primitives' && (
        <div className="space-y-10">
          {/* Typography Scale */}
          <section className="space-y-4 bg-surface-0 p-6 rounded-xl border border-border-default">
            <h3 className="text-h3 font-semibold text-foreground">1. Typography Hierarchy</h3>
            <div className="space-y-3">
              <div className="text-display">Display Header (36px Bold)</div>
              <div className="text-h1">Heading 1 (24px SemiBold)</div>
              <div className="text-h2">Heading 2 (20px SemiBold)</div>
              <div className="text-h3">Heading 3 (18px SemiBold)</div>
              <div className="text-h4">Heading 4 (16px SemiBold)</div>
              <div className="text-body">Body Text Primary (14px Regular) - High legibility off-white slate text.</div>
              <div className="text-body-medium text-foreground-secondary">
                Body Medium (14px Medium) - Secondary label hierarchy.
              </div>
              <div className="text-caption">Caption Text (12px Regular) - Micro metadata and timestamps.</div>
              <div className="text-metric text-primary">₹48.2L (Metric Monospace 28px)</div>
            </div>
          </section>

          {/* Color Tokens */}
          <section className="space-y-4 bg-surface-0 p-6 rounded-xl border border-border-default">
            <h3 className="text-h3 font-semibold text-foreground">2. Centralized Color Tokens</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs font-mono">
              <div className="p-3 rounded bg-background border border-border-default">
                <div className="font-bold text-foreground">Background</div>
                <div className="text-foreground-tertiary">#0B0E14</div>
              </div>
              <div className="p-3 rounded bg-surface border border-border-default">
                <div className="font-bold text-foreground">Surface 0</div>
                <div className="text-foreground-tertiary">#12161F</div>
              </div>
              <div className="p-3 rounded bg-surface-hover border border-border-default">
                <div className="font-bold text-foreground">Surface 1</div>
                <div className="text-foreground-tertiary">#1A202C</div>
              </div>
              <div className="p-3 rounded bg-surface-elevated border border-border-default">
                <div className="font-bold text-foreground">Surface 2</div>
                <div className="text-foreground-tertiary">#242C3D</div>
              </div>
              <div className="p-3 rounded bg-primary text-white">
                <div className="font-bold">Primary Brand</div>
                <div className="opacity-80">#2563EB</div>
              </div>
              <div className="p-3 rounded bg-signal-high text-black font-bold">
                <div>Signal High</div>
                <div>#F59E0B</div>
              </div>
              <div className="p-3 rounded bg-signal-qualified text-black font-bold">
                <div>Signal Qualified</div>
                <div>#10B981</div>
              </div>
              <div className="p-3 rounded bg-signal-urgent text-white font-bold">
                <div>Signal Urgent</div>
                <div>#EF4444</div>
              </div>
            </div>
          </section>

          {/* Buttons */}
          <section className="space-y-4 bg-surface-0 p-6 rounded-xl border border-border-default">
            <h3 className="text-h3 font-semibold text-foreground">3. Button System</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                leftIcon={<PhoneCall className="w-4 h-4" />}
                onClick={() => toast.success('Initiating AI Voice Agent call...')}
              >
                AI Call
              </Button>
              <Button
                variant="secondary"
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
                onClick={() => toast.info('Filters drawer opened')}
              >
                Filter Opportunities
              </Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger">Close Account</Button>
              <Button variant="success">Mark Won</Button>
              <Button variant="primary" isLoading>
                Discovering
              </Button>
              <Button variant="icon">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </section>

          {/* Form Inputs */}
          <section className="space-y-4 bg-surface-0 p-6 rounded-xl border border-border-default">
            <h3 className="text-h3 font-semibold text-foreground">4. Form Inputs & Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchInput
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClear={() => setSearchValue('')}
              />
              <Input label="Target Account Domain" placeholder="e.g. acme.com" helperText="Enter domain for instant tech stack scan" />
              <Select
                label="Filter by Intent Score"
                options={[
                  { label: 'All Intent Levels', value: 'all' },
                  { label: 'High Intent (80+)', value: 'high' },
                  { label: 'Moderate Intent (50–79)', value: 'medium' },
                ]}
              />
              <Textarea label="Custom Pitch Angle Instructions" placeholder="Instruct your AI agent on specific objection parameters..." />
            </div>
          </section>

          {/* Badges & Avatars */}
          <section className="space-y-4 bg-surface-0 p-6 rounded-xl border border-border-default">
            <h3 className="text-h3 font-semibold text-foreground">5. Semantic Badges & Avatars</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="high-intent" pulse>
                HIGH INTENT
              </Badge>
              <Badge variant="qualified">QUALIFIED</Badge>
              <Badge variant="urgent">URGENT</Badge>
              <Badge variant="calling" pulse>
                CALLING
              </Badge>
              <Badge variant="follow-up">FOLLOW-UP</Badge>
              <Badge variant="neutral">DISCOVERED</Badge>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <Avatar type="user" name="Megh Rana" size="md" />
              <Avatar type="company" name="Acme Labs" size="md" />
              <Avatar type="ai" size="md" />
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: SALES INTELLIGENCE */}
      {activeTab === 'sales' && (
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-h3 font-semibold text-foreground">Intent Score Engine ("Why Now?")</h3>
            <IntentScore score={94} level="high" showDetailsDefault />
          </section>

          <section className="space-y-4">
            <h3 className="text-h3 font-semibold text-foreground">Next Best Action Execution Banner</h3>
            <NextBestAction
              actionText="Initiate AI Voice Agent touchpoint within 2 hours."
              reasonText="Prospect posted urgent hiring request for 4 Sales Engineer positions 24 hours ago."
              actionType="call"
              onAction={() => toast.success('Launching AI Dialer Session...')}
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-h3 font-semibold text-foreground">Opportunity Prospect Card</h3>
            <OpportunityCard
              opportunity={sampleOpp}
              onAction={(opp) => toast.info(`Starting AI Call with ${opp.companyName}`)}
            />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-h3 font-semibold text-foreground mb-3">Signal Provenance</h3>
              <SignalSourceBadge source={sampleOpp.signalSource} />
            </div>
            <div>
              <h3 className="text-h3 font-semibold text-foreground mb-3">Qualification Scorecard</h3>
              <QualificationMatrix />
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: AI ACTIVITY & BRIEFS */}
      {activeTab === 'ai' && (
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-h3 font-semibold text-foreground">Signature Intent Detection Flow</h3>
            <IntentDetectionAnimation />
          </section>

          <section className="space-y-4">
            <h3 className="text-h3 font-semibold text-foreground">AI Status Indicators</h3>
            <div className="flex flex-wrap items-center gap-3">
              <AIStatus state="discovering" />
              <AIStatus state="analyzing" />
              <AIStatus state="enriching" />
              <AIStatus state="calling" />
              <AIStatus state="completed" />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-h3 font-semibold text-foreground">AI Sales Brief Synthesis</h3>
            <AISalesBrief />
          </section>

          <section className="space-y-4">
            <h3 className="text-h3 font-semibold text-foreground">Active Processing Bar</h3>
            <AIProcessing progress={74} label="Calculating Buying Signal Intent..." />
          </section>
        </div>
      )}

      {/* TAB 4: DATA & ANALYTICS */}
      {activeTab === 'data' && (
        <div className="space-y-8">
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Metric label="QUALIFIED PIPELINE" value="₹48.2L" trend="up" trendValue="+24%" context="vs last week" />
            <Metric label="ACTIVE HIGH-INTENT LEADS" value="38" trend="up" trendValue="+8" context="new signals" />
            <Metric label="AI CALL CONVERSION RATE" value="34.2%" trend="up" trendValue="+5.1%" context="meeting booked" />
          </section>

          <section className="space-y-4">
            <h3 className="text-h3 font-semibold text-foreground">Enterprise Data Grid</h3>
            <DataTable
              columns={[
                { key: 'company', header: 'Company Name', sortable: true },
                {
                  key: 'intent',
                  header: 'Intent Score',
                  sortable: true,
                  render: (row) => <IntentScore score={row.intent} expandable={false} />,
                },
                {
                  key: 'status',
                  header: 'Sales Status',
                  render: (row) => <SalesStatus status={row.status} />,
                },
                { key: 'value', header: 'Est. Value', sortable: true },
                {
                  key: 'action',
                  header: 'Action',
                  render: (row) => (
                    <Button variant="secondary" size="sm" leftIcon={<PhoneCall className="w-3.5 h-3.5" />}>
                      Call
                    </Button>
                  ),
                },
              ]}
              data={sampleTableData}
              keyExtractor={(r) => r.id}
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-h3 font-semibold text-foreground">Activity Timeline</h3>
            <ActivityTimeline />
          </section>
        </div>
      )}

      {/* TAB 5: SYSTEM FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-h3 font-semibold text-foreground">Empty State</h3>
            <EmptyState onAction={() => toast.success('Scanning public feeds...')} />
          </section>

          <section className="space-y-4">
            <h3 className="text-h3 font-semibold text-foreground">Error Handling</h3>
            <ErrorState onRetry={() => toast.info('Retrying connection...')} />
          </section>

          <section className="space-y-4">
            <h3 className="text-h3 font-semibold text-foreground">Loading Skeletons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSkeleton />
              <MetricSkeleton />
            </div>
          </section>
        </div>
      )}

      {/* TEST MODAL & DRAWER */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Initiate Autonomous AI Call"
        subtitle="Confirm call parameters before dispatching agent"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              leftIcon={<PhoneCall className="w-4 h-4" />}
              onClick={() => {
                setModalOpen(false);
                toast.success('AI Call Dispatched to Prospect!');
              }}
            >
              Start Dialing
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-body text-foreground-secondary">
          <p>
            Your AI sales agent will dial <strong className="text-foreground">Sarah Jenkins (VP Ops)</strong> using the
            synthesized brief for <strong className="text-foreground">Acme Software Labs</strong>.
          </p>
          <div className="p-3 bg-surface-1 rounded-lg border border-border-subtle text-xs space-y-1">
            <div className="font-semibold text-foreground">Target Objective: Book 20m Demo</div>
            <div className="text-foreground-tertiary">Estimated duration: 3–5 minutes</div>
          </div>
        </div>
      </Modal>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Account Intelligence 360"
        subtitle="Detailed signals and technical telemetry"
      >
        <div className="space-y-6">
          <IntentScore score={94} showDetailsDefault />
          <AISalesBrief />
        </div>
      </Drawer>
    </div>
  );
};

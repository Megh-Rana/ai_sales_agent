import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/shell/AppShell';
import { RoutePlaceholder } from './pages/RoutePlaceholder';
import { NotFound } from './pages/NotFound';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { BusinessOnboarding } from './pages/BusinessOnboarding';
import { LeadDiscovery } from './pages/LeadDiscovery';
import { LeadDetails } from './pages/LeadDetails';
import { AICalling } from './pages/AICalling';
import { CallResults } from './pages/CallResults';
import { Analytics } from './pages/Analytics';
import { ActionCenter } from './pages/ActionCenter';
import { Campaigns } from './pages/Campaigns';
import { CampaignDetail } from './pages/CampaignDetail';
import { FollowUps } from './pages/FollowUps';
import { Opportunities } from './pages/Opportunities';
import { SalesCopilot } from './pages/SalesCopilot';
import { RevenueCommandCenter } from './pages/RevenueCommandCenter';
import { DesignSystemShowcase } from './pages/DesignSystemShowcase';
import { Toaster } from 'sonner';

import { ThemeProvider, useTheme } from './context/ThemeContext';

import { LandingPage } from './pages/LandingPage';

function AppContent() {
  const { theme } = useTheme();
  return (
    <BrowserRouter>
      <Toaster richColors position="bottom-right" theme={theme} closeButton />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* INTERNAL DESIGN SYSTEM SHOWCASE (Standalone without AppShell) */}
        <Route path="/design-system" element={<DesignSystemShowcase />} />

        {/* APPLICATION ROUTES WRAPPED IN APP SHELL */}
        <Route
          path="*"
          element={
            <AppShell>
              <Routes>
                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Revenue Command Center */}
                <Route path="/command-center" element={<RevenueCommandCenter />} />

                {/* Opportunity Radar */}
                <Route path="/opportunities" element={<Opportunities />} />
                <Route path="/opportunities/:id" element={<Opportunities />} />

                {/* Sales Copilot & Conversation Intelligence */}
                <Route path="/copilot" element={<SalesCopilot />} />
                <Route path="/copilot/:leadId" element={<SalesCopilot />} />

                {/* Intent & Lead Discovery */}
                <Route path="/intent" element={<Navigate to="/leads/discover" replace />} />
                <Route path="/leads" element={<Navigate to="/leads/discover" replace />} />
                <Route path="/leads/discover" element={<LeadDiscovery />} />
                <Route path="/leads/:id" element={<LeadDetails />} />
                <Route path="/leads/:leadId" element={<LeadDetails />} />

                {/* Outreach Campaigns */}
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/campaigns/:id" element={<CampaignDetail />} />

                {/* Call Results & AI Qualification */}
                <Route path="/calls/:id/results" element={<CallResults />} />
                <Route path="/calls/:callId/results" element={<CallResults />} />

                {/* AI Voice Agent Calls */}
                <Route path="/calls" element={<AICalling />} />
                <Route path="/calls/:id" element={<AICalling />} />
                <Route path="/calls/:callId" element={<AICalling />} />

                {/* Follow-ups Queue & Sequence Intelligence */}
                <Route path="/follow-ups" element={<FollowUps />} />
                <Route path="/follow-ups/:id" element={<FollowUps />} />

                {/* Sales Action Center */}
                <Route path="/actions" element={<ActionCenter />} />

                {/* Analytics */}
                <Route path="/analytics" element={<Analytics />} />

                {/* Business Profile */}
                <Route path="/business" element={<BusinessOnboarding />} />
                <Route path="/business/onboarding" element={<BusinessOnboarding />} />

                {/* Settings Sub-routes */}
                <Route
                  path="/settings"
                  element={
                    <RoutePlaceholder
                      title="Workspace Settings"
                      description="Configure account preferences, integrations, security, and notification channels."
                      badge="Settings"
                    />
                  }
                />
                <Route
                  path="/settings/profile"
                  element={
                    <RoutePlaceholder title="User Profile Settings" description="Personal details, avatar, and authentication preferences." badge="Settings" />
                  }
                />
                <Route
                  path="/settings/business"
                  element={
                    <RoutePlaceholder title="Business Workspace Settings" description="Company domain, seat allocations, and API keys." badge="Settings" />
                  }
                />
                <Route
                  path="/settings/team"
                  element={
                    <RoutePlaceholder title="Team & Member Seats" description="Invite team members, assign sales roles, and manage permissions." badge="Settings" />
                  }
                />
                <Route
                  path="/settings/notifications"
                  element={
                    <RoutePlaceholder title="Notification Channels" description="Configure Slack, Email, and Webhook alert triggers for high-intent signals." badge="Settings" />
                  }
                />
                <Route
                  path="/settings/subscription"
                  element={
                    <RoutePlaceholder title="Subscription & Billing" description="Manage enterprise tier plan, invoice history, and AI voice usage credits." badge="Settings" />
                  }
                />
                <Route
                  path="/settings/security"
                  element={
                    <RoutePlaceholder title="Security & SSO Settings" description="SAML SSO integration, 2FA enforcement, and active session audit." badge="Settings" />
                  }
                />

                {/* Admin Sub-routes */}
                <Route
                  path="/admin"
                  element={
                    <RoutePlaceholder title="Administration Portal" description="Global platform monitoring, user management, and system health." badge="Administration" />
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <RoutePlaceholder title="Global User Management" description="Provision accounts, reset access, and audit user activity." badge="Admin" />
                  }
                />
                <Route
                  path="/admin/campaigns"
                  element={
                    <RoutePlaceholder title="System Campaign Monitoring" description="Global cadence performance, volume throttling, and queue health." badge="Admin" />
                  }
                />
                <Route
                  path="/admin/voice-usage"
                  element={
                    <RoutePlaceholder title="AI Voice Usage Telemetry" description="SIP latency, call duration analytics, and telephony costs." badge="Admin" />
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <RoutePlaceholder title="System Audit Logs" description="Immutable security audit trail of all administrative events." badge="Admin" />
                  }
                />
                <Route
                  path="/admin/fraud"
                  element={
                    <RoutePlaceholder title="Fraud & Anomaly Detection" description="Automated threat monitoring and abuse prevention rules." badge="Admin" />
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

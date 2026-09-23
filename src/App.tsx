import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { ErrorBoundary } from './components/ui/ErrorBoundary';
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
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';
import { ForceChangePasswordModal } from './components/auth/ForceChangePasswordModal';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminVoiceUsage } from './pages/admin/AdminVoiceUsage';
import { AdminBilling } from './pages/admin/AdminBilling';
import { AdminFraud } from './pages/admin/AdminFraud';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { theme } = useTheme();
  return (
    <BrowserRouter>
      <Toaster richColors position="bottom-right" theme={theme} closeButton />
      <PWAInstallBanner />
      <ForceChangePasswordModal />
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
            <ProtectedRoute>
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
                <Route path="/calls" element={<ErrorBoundary fallbackMessage="The call session encountered an error. Please go back and try again."><AICalling /></ErrorBoundary>} />
                <Route path="/calls/:id" element={<ErrorBoundary fallbackMessage="The call session encountered an error. Please go back and try again."><AICalling /></ErrorBoundary>} />
                <Route path="/calls/:callId" element={<ErrorBoundary fallbackMessage="The call session encountered an error. Please go back and try again."><AICalling /></ErrorBoundary>} />

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
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/voice-usage" element={<AdminRoute><AdminVoiceUsage /></AdminRoute>} />
                <Route path="/admin/billing" element={<AdminRoute><AdminBilling /></AdminRoute>} />
                <Route path="/admin/audit-logs" element={<AdminRoute><AdminAuditLogs /></AdminRoute>} />
                <Route path="/admin/fraud" element={<AdminRoute><AdminFraud /></AdminRoute>} />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

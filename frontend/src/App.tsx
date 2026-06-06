import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth.store';

import { AppShell, PublicLayout, ProtectedRoute } from './components/layout/AppShell';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { LandingPage } from './pages/LandingPage';
import { CampaignsPage, CampaignDetailPage, CreateCampaignPage, CampaignEditPage } from './pages';
import { DashboardOverviewPage, DashboardCampaignsPage, DashboardSettingsPage } from './pages/DashboardPages';
import { AdminUsersPage, AdminDonationsPage, AdminReportsPage, AnalyticsRouterPage } from './pages/AdminPages';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } },
});

function AppInit({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, fetchProfile } = useAuthStore();
  // Re-validate the persisted session once on mount only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (isAuthenticated) fetchProfile().catch(() => {}); }, []);
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInit>
          <Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/campaigns/:slug" element={<CampaignDetailPage />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected dashboard */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<DashboardOverviewPage />} />
                <Route path="/dashboard/campaigns" element={<DashboardCampaignsPage />} />
                <Route path="/dashboard/campaigns/new" element={<CreateCampaignPage />} />
                <Route path="/dashboard/campaigns/:id/edit" element={<CampaignEditPage />} />
                <Route path="/dashboard/analytics" element={<AnalyticsRouterPage />} />
                <Route path="/dashboard/settings" element={<DashboardSettingsPage />} />
                {/* Admin-only */}
                <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                  <Route path="/dashboard/users" element={<AdminUsersPage />} />
                  <Route path="/dashboard/donations" element={<AdminDonationsPage />} />
                  <Route path="/dashboard/reports" element={<AdminReportsPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppInit>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0e1c33', color: '#e2e8f0', fontSize: '13px',
            borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 12px 32px -10px rgba(7,15,31,0.5)', padding: '10px 14px',
          },
          success: { iconTheme: { primary: '#14b8a6', secondary: '#fff' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  );
}

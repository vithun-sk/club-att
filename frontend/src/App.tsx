import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClubDataProvider } from './context/ClubDataContext';
import { Shell } from './components/layout/Shell';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { MemberManagement } from './pages/admin/MemberManagement';
import { EventManagement } from './pages/admin/EventManagement';
import { QRAttendancePage } from './pages/admin/QRAttendancePage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { IntegrityMonitorPage } from './pages/admin/IntegrityMonitorPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { UserDashboard } from './pages/user/UserDashboard';
import { UserEventsPage } from './pages/user/UserEventsPage';
import { UserBadgesPage } from './pages/user/UserBadgesPage';
import { UserPassPage } from './pages/user/UserPassPage';

import type { ActivePage } from './types';

const MainAppContent: React.FC = () => {
  const { role, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<ActivePage>('landing');
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(undefined);

  // Unauthenticated routes
  if (!isAuthenticated) {
    if (currentPage === 'login') {
      return <LoginPage onNavigate={setCurrentPage} />;
    }
    if (currentPage === 'register') {
      return <RegisterPage onNavigate={setCurrentPage} />;
    }
    return <LandingPage onNavigate={setCurrentPage} />;
  }

  // Admin and user page lists for role separation
  const adminPages: ActivePage[] = ['dashboard', 'members', 'events', 'qr-live', 'analytics', 'integrity', 'reports'];
  const userPages: ActivePage[] = ['user-dashboard', 'user-events', 'user-badges', 'user-pass'];

  // Role separation enforcement:
  // Non-admin users attempting to access admin pages get redirected to user-dashboard
  // Admin users accessing user pages get redirected to admin dashboard
  const effectivePage = (role !== 'admin' && adminPages.includes(currentPage))
    ? 'user-dashboard'
    : (role === 'admin' && userPages.includes(currentPage))
    ? 'dashboard'
    : (currentPage === 'login' || currentPage === 'register' || currentPage === 'landing')
    ? (role === 'admin' ? 'dashboard' : 'user-dashboard')
    : currentPage;

  return (
    <Shell currentPage={effectivePage} onNavigate={setCurrentPage}>
      {/* Admin Pages */}
      {role === 'admin' && (
        <>
          {effectivePage === 'dashboard' && (
            <AdminDashboard
              onNavigate={setCurrentPage}
              onSelectMember={(member) => {
                setSelectedMemberId(member.id);
                setCurrentPage('members');
              }}
            />
          )}

          {effectivePage === 'members' && (
            <MemberManagement selectedMemberId={selectedMemberId} />
          )}

          {effectivePage === 'events' && (
            <EventManagement onNavigate={setCurrentPage} />
          )}

          {effectivePage === 'qr-live' && (
            <QRAttendancePage />
          )}

          {effectivePage === 'analytics' && (
            <AnalyticsPage />
          )}

          {effectivePage === 'integrity' && (
            <IntegrityMonitorPage />
          )}

          {effectivePage === 'reports' && (
            <ReportsPage />
          )}
        </>
      )}

      {/* User / Student Pages */}
      {role !== 'admin' && (
        <>
          {effectivePage === 'user-dashboard' && (
            <UserDashboard onNavigate={setCurrentPage} />
          )}

          {effectivePage === 'user-events' && (
            <UserEventsPage />
          )}

          {effectivePage === 'user-badges' && (
            <UserBadgesPage />
          )}

          {effectivePage === 'user-pass' && (
            <UserPassPage />
          )}
        </>
      )}
    </Shell>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ClubDataProvider>
          <MainAppContent />
        </ClubDataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

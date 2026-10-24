import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClubData } from '../../context/ClubDataContext';
import type { ActivePage } from '../../types';
import {
  LayoutDashboard,
  Users,
  Calendar,
  QrCode,
  BarChart3,
  ShieldAlert,
  FileText,
  Award,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface SidebarProps {
  currentPage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { role } = useAuth();
  const { integrityLogs, members, events } = useClubData();

  const atRiskCount = members.filter((m) => m.status === 'at-risk').length;
  const underReviewLogs = integrityLogs.filter((l) => l.status === 'under_review').length;
  const liveEvent = events.find((e) => e.status === 'live');

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div
        style={{
          padding: '1.25rem 1.25rem 1rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--brand-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.1rem',
            boxShadow: 'var(--brand-glow)'
          }}
        >
          ⚡
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            ClubPulse
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            {role === 'admin' ? 'ADMIN WORKSPACE' : 'STUDENT PORTAL'}
          </div>
        </div>
      </div>

      {/* Role Navigation Links */}
      <div style={{ flex: 1, padding: '1.25rem 0.85rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {role === 'admin' ? (
          <>
            <div style={{ padding: '0 0.5rem 0.5rem 0.5rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Management Console
            </div>

            <NavItem
              label="Dashboard"
              icon={<LayoutDashboard size={17} />}
              active={currentPage === 'dashboard'}
              onClick={() => onNavigate('dashboard')}
            />

            <NavItem
              label="Member Roster"
              icon={<Users size={17} />}
              active={currentPage === 'members'}
              badge={atRiskCount > 0 ? `${atRiskCount} at-risk` : undefined}
              badgeType="warning"
              onClick={() => onNavigate('members')}
            />

            <NavItem
              label="Events & Schedule"
              icon={<Calendar size={17} />}
              active={currentPage === 'events'}
              onClick={() => onNavigate('events')}
            />

            <NavItem
              label="Live QR Station"
              icon={<QrCode size={17} />}
              active={currentPage === 'qr-live'}
              badge={liveEvent ? 'LIVE' : undefined}
              badgeType="success"
              onClick={() => onNavigate('qr-live')}
            />

            <div style={{ margin: '1rem 0 0.5rem 0', padding: '0 0.5rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Intelligence & Auditing
            </div>

            <NavItem
              label="Engagement Analytics"
              icon={<BarChart3 size={17} />}
              active={currentPage === 'analytics'}
              onClick={() => onNavigate('analytics')}
            />

            <NavItem
              label="Integrity Monitor"
              icon={<ShieldAlert size={17} />}
              active={currentPage === 'integrity'}
              badge={underReviewLogs > 0 ? `${underReviewLogs} alerts` : undefined}
              badgeType="danger"
              onClick={() => onNavigate('integrity')}
            />

            <NavItem
              label="Reports & Export"
              icon={<FileText size={17} />}
              active={currentPage === 'reports'}
              onClick={() => onNavigate('reports')}
            />
          </>
        ) : (
          /* User / Student Navigation ONLY - No admin routes */
          <>
            <div style={{ padding: '0 0.5rem 0.5rem 0.5rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              My Club Experience
            </div>

            <NavItem
              label="My Attendance"
              icon={<LayoutDashboard size={17} />}
              active={currentPage === 'user-dashboard'}
              onClick={() => onNavigate('user-dashboard')}
            />

            <NavItem
              label="Events & RSVPs"
              icon={<Calendar size={17} />}
              active={currentPage === 'user-events'}
              onClick={() => onNavigate('user-events')}
            />

            <NavItem
              label="Badges & Streaks"
              icon={<Award size={17} />}
              active={currentPage === 'user-badges'}
              badge="Top 5%"
              badgeType="brand"
              onClick={() => onNavigate('user-badges')}
            />

            <NavItem
              label="My Club Pass QR"
              icon={<Smartphone size={17} />}
              active={currentPage === 'user-pass'}
              onClick={() => onNavigate('user-pass')}
            />
          </>
        )}
      </div>

      {/* Role Notice & Hackathon Footer */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}
      >
        <div
          style={{
            padding: '0.75rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontWeight: 600, marginBottom: '0.2rem' }}>
            <Sparkles size={14} />
            Hackathon Demo Mode
          </div>
          <p style={{ fontSize: '0.69rem', color: 'var(--text-dim)', lineHeight: 1.35, margin: 0 }}>
            Role: <strong>{role === 'admin' ? 'Administrator' : 'Student User'}</strong>. Frontend role separation active.
          </p>
        </div>
      </div>
    </aside>
  );
};

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'danger' | 'brand';
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  label,
  icon,
  active,
  badge,
  badgeType = 'brand',
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0.65rem 0.85rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid transparent',
        background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
        borderColor: active ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
        color: active ? '#ffffff' : 'var(--text-muted)',
        fontWeight: active ? 600 : 500,
        fontSize: '0.865rem',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        textAlign: 'left'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <span style={{ color: active ? 'var(--brand-500)' : 'var(--text-dim)' }}>
          {icon}
        </span>
        <span>{label}</span>
      </div>

      {badge && (
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '0.15rem 0.45rem',
            borderRadius: 'var(--radius-full)',
            textTransform: 'uppercase',
            backgroundColor:
              badgeType === 'success'
                ? 'var(--success-bg)'
                : badgeType === 'warning'
                ? 'var(--warning-bg)'
                : badgeType === 'danger'
                ? 'var(--danger-bg)'
                : 'rgba(99, 102, 241, 0.2)',
            color:
              badgeType === 'success'
                ? 'var(--success)'
                : badgeType === 'warning'
                ? 'var(--warning)'
                : badgeType === 'danger'
                ? 'var(--danger)'
                : '#818cf8',
            border: `1px solid ${
              badgeType === 'success'
                ? 'var(--success-border)'
                : badgeType === 'warning'
                ? 'var(--warning-border)'
                : badgeType === 'danger'
                ? 'var(--danger-border)'
                : 'rgba(99, 102, 241, 0.3)'
            }`
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

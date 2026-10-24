import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClubData } from '../../context/ClubDataContext';
import { LogOut, Radio } from 'lucide-react';
import type { ActivePage } from '../../types';

interface NavbarProps {
  onNavigate: (page: ActivePage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { currentUser, role, logout } = useAuth();
  const { events } = useClubData();

  const liveEvent = events.find((e) => e.status === 'live');

  return (
    <header className="app-topbar">
      {/* Left: Club Brand & Live Pulse indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
              fontWeight: 800,
              fontSize: '1rem',
              color: '#ffffff'
            }}
          >
            CP
          </div>
          <div>
            <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              ClubPulse
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.email || 'Campus Club'}
            </div>
          </div>
        </div>

        {liveEvent && (
          <div
            onClick={() => onNavigate('qr-live')}
            style={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--success)'
            }}
            title="Click to view QR attendance station"
          >
            <Radio size={14} className="pulse-indicator" />
            <span>Live Session: {liveEvent.title.slice(0, 22)}...</span>
          </div>
        )}
      </div>

      {/* Right Controls: User Profile & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Current User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {currentUser?.email}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              {role === 'admin' ? 'Club Administrator' : 'Member'}
            </span>
          </div>

          <button
            onClick={() => {
              logout();
              onNavigate('login');
            }}
            className="btn-ghost"
            style={{
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dim)'
            }}
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

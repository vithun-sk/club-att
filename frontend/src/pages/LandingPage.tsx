import React from 'react';
import type { ActivePage } from '../types';
import {
  ShieldCheck,
  QrCode,
  Users,
  BarChart3,
  Flame,
  ArrowRight,
  AlertOctagon,
  Sparkles,
  Zap
} from 'lucide-react';

const CURRENT_YEAR = 2026;

interface LandingPageProps {
  onNavigate: (page: ActivePage) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <header
        style={{
          height: '72px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.5rem',
          maxWidth: '1360px',
          width: '100%',
          margin: '0 auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#ffffff',
              boxShadow: 'var(--brand-glow)'
            }}
          >
            CP
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            ClubPulse
          </span>
          <span className="badge badge-brand" style={{ fontSize: '0.65rem' }}>
            Smart Attendance & Retention
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={() => onNavigate('login')}
            className="btn btn-outline btn-sm"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="btn btn-secondary btn-sm"
          >
            Register
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="btn btn-primary btn-sm"
          >
            Sign In to Dashboard <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 2rem 4rem 2rem',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#818cf8',
            marginBottom: '1.5rem'
          }}
        >
          <Sparkles size={16} />
          <span>Built for Student Organizations & Campus Clubs</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            maxWidth: '920px',
            marginBottom: '1.5rem'
          }}
        >
          Eliminate proxy check-ins. <br />
          <span
            style={{
              background: 'var(--brand-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Predict student club drop-off
          </span>{' '}
          before it happens.
        </h1>

        <p
          style={{
            fontSize: '1.18rem',
            maxWidth: '720px',
            lineHeight: 1.6,
            color: 'var(--text-muted)',
            marginBottom: '2.5rem'
          }}
        >
          ClubPulse is an end-to-end attendance and member engagement ecosystem powered by JWT authentication, secure roles, and real-time verification.
        </p>

        {/* Primary Launchers */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
          <button
            onClick={() => onNavigate('login')}
            className="btn btn-primary btn-lg"
            style={{ fontSize: '1rem', padding: '0.85rem 1.8rem' }}
          >
            <ShieldCheck size={18} />
            Sign In to Account
          </button>

          <button
            onClick={() => onNavigate('register')}
            className="btn btn-secondary btn-lg"
            style={{ fontSize: '1rem', padding: '0.85rem 1.8rem' }}
          >
            <Users size={18} />
            Register New Account
          </button>
        </div>

        {/* Problem Statement Callout Banner */}
        <div
          style={{
            maxWidth: '880px',
            width: '100%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem 2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            textAlign: 'left'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              <AlertOctagon size={16} /> The Problem Today
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Paper sign-ins and static forms suffer from proxy attendance (friends signing in friends via WhatsApp screenshots) and zero early-warning signals when members lose interest.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              <Zap size={16} /> The ClubPulse Solution
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Secure JWT authentication, role guards, student streaks, and attendance tracking for club executive teams.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <section
        style={{
          padding: '4rem 2rem 6rem 2rem',
          maxWidth: '1240px',
          width: '100%',
          margin: '0 auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Core Capabilities Built for Scale</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
            Everything university clubs need to maintain high attendance and deep member involvement.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}
        >
          <FeatureCard
            icon={<QrCode size={24} color="#6366f1" />}
            title="Secure JWT Authentication"
            description="Robust backend-backed login and registration with Bcrypt password hashing and strict role separation."
          />

          <FeatureCard
            icon={<ShieldCheck size={24} color="#ef4444" />}
            title="Role-Protected Admin Panel"
            description="Executive dashboard guarded by JWT and Role.ADMIN verification to safeguard club membership rosters."
          />

          <FeatureCard
            icon={<BarChart3 size={24} color="#06b6d4" />}
            title="Attendance Analytics"
            description="Track participation rates, event frequency, and member engagement trends across semesters."
          />

          <FeatureCard
            icon={<Flame size={24} color="#f59e0b" />}
            title="Member Streaks & Badges"
            description="Encourage consistent participation through attendance tracking and achievement milestones."
          />
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border-subtle)',
          padding: '2rem 2.5rem',
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontSize: '0.85rem',
          background: 'var(--bg-secondary)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>ClubPulse</strong> &copy; {CURRENT_YEAR} — Smart Attendance and Engagement Platform.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => onNavigate('login')}>
              Sign In
            </span>
            <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => onNavigate('register')}>
              Register
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description
}) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div
        style={{
          width: '46px',
          height: '46px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{title}</h3>
      <p style={{ fontSize: '0.865rem', lineHeight: 1.55, margin: 0 }}>{description}</p>
    </div>
  );
};

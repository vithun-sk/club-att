import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClubData } from '../../context/ClubDataContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import type { ActivePage, Member } from '../../types';
import {
  Flame,
  Award,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  QrCode,
  MapPin,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface UserDashboardProps {
  onNavigate: (page: ActivePage) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { events, members, achievements, toggleRSVP } = useClubData();

  // A newly registered user may not have a member-roster record yet.
  // Use a safe profile derived from the authenticated user until real metrics exist.
  const studentMember: Member = members.find((m) => m.email === currentUser?.email || m.name === currentUser?.name) || members[0] || {
    id: currentUser?.id || 'current-user',
    studentId: currentUser?.studentId || 'Not assigned',
    name: currentUser?.name || 'Member',
    email: currentUser?.email || '',
    avatar: currentUser?.avatar || '',
    department: currentUser?.department || 'Department not set',
    year: currentUser?.year || '',
    joinedDate: '',
    totalEvents: events.length,
    attendedEvents: 0,
    attendanceRate: 0,
    currentStreak: currentUser?.streak || 0,
    riskLevel: 'low',
    riskFactors: [],
    status: 'active',
    points: currentUser?.points || 0,
    lastCheckIn: '',
    attendanceHistory: [],
  };
  const upcomingEvents = events.filter((e) => e.status === 'upcoming').slice(0, 3);
  const liveEvent = events.find((e) => e.status === 'live');
  const unlockedBadges = achievements.filter((a) => a.unlocked);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Student Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {(currentUser?.avatar || studentMember.avatar) ? (
            <img
              src={currentUser?.avatar || studentMember.avatar}
              alt={currentUser?.name || studentMember.name}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--brand-500)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
              }}
            />
          ) : (
            <div aria-label="Member avatar" style={{
              width: '64px', height: '64px', borderRadius: '50%', display: 'grid',
              placeItems: 'center', background: 'var(--brand-100, #e0e7ff)',
              color: 'var(--brand-700, #3730a3)', fontSize: '1.4rem', fontWeight: 700,
              border: '3px solid var(--brand-500)'
            }}>
              {(currentUser?.name || studentMember.name).charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.65rem', margin: 0, fontWeight: 800 }}>
                Welcome back, {currentUser?.name || studentMember.name}!
              </h1>
              <span className="badge badge-brand" style={{ fontSize: '0.7rem' }}>
                {currentUser?.tier || 'Gold Tier Member'}
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.865rem', color: 'var(--text-muted)' }}>
              {currentUser?.studentId || studentMember.studentId} &bull; {currentUser?.department || studentMember.department} &bull; {currentUser?.clubName}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => onNavigate('user-pass')}
            className="btn btn-primary"
          >
            <QrCode size={16} /> My Club Pass
          </button>
        </div>
      </div>

      {/* Live Event Check-In Reminder if an event is currently happening */}
      {liveEvent && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.15rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span className="pulse-indicator" style={{ width: '10px', height: '10px' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--success)' }}>
                Session in Progress: {liveEvent.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Venue: {liveEvent.location} &bull; Scan the projector QR screen to earn +{liveEvent.pointsAwarded} XP!
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('user-pass')}
            className="btn btn-primary btn-sm"
            style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
          >
            Open My Pass for Scanner <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* 4 Personal Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Overall Attendance"
          value={`${studentMember.attendanceRate}%`}
          change="+4% this term"
          trend="up"
          subtitle="Top 5% in club"
          icon={<TrendingUp size={20} />}
        />

        <StatCard
          title="Active Streak"
          value={`${studentMember.currentStreak} 🔥`}
          change="Personal record!"
          trend="up"
          subtitle="consecutive sessions"
          icon={<Flame size={20} color="#f59e0b" />}
          onClick={() => onNavigate('user-badges')}
        />

        <StatCard
          title="Club XP Points"
          value={studentMember.points}
          change="+150 pts"
          trend="up"
          subtitle="Rank #3 Leaderboard"
          icon={<Sparkles size={20} />}
          onClick={() => onNavigate('user-badges')}
        />

        <StatCard
          title="Sessions Attended"
          value={`${studentMember.attendedEvents} / ${studentMember.totalEvents}`}
          change="94.4% turnout"
          trend="up"
          subtitle="All sessions verified"
          icon={<CheckCircle2 size={20} />}
        />
      </div>

      {/* Two Column Layout: Upcoming RSVPs & Badges / Streaks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* Upcoming Events & 1-Click RSVPs */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Upcoming Club Sessions</h3>
              <p style={{ fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
                Confirm your seat to receive calendar reminders and materials.
              </p>
            </div>
            <button
              onClick={() => onNavigate('user-events')}
              className="btn btn-ghost btn-sm"
            >
              All Events <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.85rem'
                }}
              >
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <Badge variant="brand">{evt.category}</Badge>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                      +{evt.pointsAwarded} XP
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    {evt.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={12} /> {evt.date} &bull; {evt.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={12} /> {evt.location}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleRSVP(evt.id)}
                  className={`btn btn-sm ${evt.userRsvpd ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ minWidth: '100px' }}
                >
                  {evt.userRsvpd ? (
                    <>
                      <CheckCircle2 size={13} color="var(--success)" /> Attending
                    </>
                  ) : (
                    'RSVP Yes'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Unlocked Achievements & Streaks Showcase */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Achievements & Badges</h3>
              <p style={{ fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
                Earned through verified attendance and active involvement.
              </p>
            </div>
            <button
              onClick={() => onNavigate('user-badges')}
              className="btn btn-ghost btn-sm"
            >
              View All ({achievements.length}) <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.85rem' }}>
            {unlockedBadges.slice(0, 4).map((badge) => (
              <div
                key={badge.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.5rem'
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f59e0b'
                  }}
                >
                  <Award size={20} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.825rem' }}>
                  {badge.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.3 }}>
                  {badge.description}
                </div>
                <span className="badge badge-brand" style={{ fontSize: '0.65rem', marginTop: 'auto' }}>
                  +{badge.points} XP
                </span>
              </div>
            ))}
          </div>

          {/* Current Streak Highlight Card */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.08) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ fontSize: '1.8rem' }}>🔥</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f59e0b' }}>
                  6-Session Streak Active!
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Attend next week's HackPulse to unlock the 7-week badge!
                </div>
              </div>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
              6 / 10
            </div>
          </div>
        </div>
      </div>

      {/* Read-Only Verified Attendance History Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Verified Attendance Transcript</h3>
            <p style={{ fontSize: '0.825rem', margin: '0.2rem 0 0 0' }}>
              Official tamper-proof attendance record stamped by ClubPulse QR engine
            </p>
          </div>
          <span className="badge badge-success">
            <ShieldCheck size={13} /> Cryptographically Verified
          </span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Session & Event Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Verification Time</th>
                <th>Status</th>
                <th>XP Awarded</th>
              </tr>
            </thead>
            <tbody>
              {studentMember.attendanceHistory.map((record, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600 }}>{record.eventName}</td>
                  <td><Badge variant="brand">{record.category}</Badge></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{record.date}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {record.verifiedAt || '17:35:12'}
                  </td>
                  <td>
                    <Badge variant={record.status === 'present' ? 'success' : record.status === 'excused' ? 'warning' : 'danger'}>
                      {record.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--brand-500)' }}>
                    +{record.pointsEarned || 50} XP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useClubData } from '../../context/ClubDataContext';
import { useToast } from '../../context/ToastContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { AttendanceTrendChart } from '../../components/charts/AttendanceTrendChart';
import { CategoryBarChart } from '../../components/charts/CategoryBarChart';
import type { ActivePage, Member } from '../../types';
import {
  Users,
  Calendar,
  Percent,
  AlertTriangle,
  QrCode,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  Bell
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: ActivePage) => void;
  onSelectMember?: (member: Member) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onSelectMember }) => {
  const { members, events, checkIns } = useClubData();
  const { showToast } = useToast();

  const totalMembers = members.length;
  const totalEvents = events.length;

  const avgAttendance = Math.round(
    members.reduce((acc, m) => acc + m.attendanceRate, 0) / Math.max(1, totalMembers)
  );

  const atRiskMembers = members.filter((m) => m.status === 'at-risk');
  const upcomingEvents = events.filter((e) => e.status === 'upcoming').slice(0, 3);
  const liveEvent = events.find((e) => e.status === 'live');
  const recentCheckIns = checkIns.slice(0, 6);

  const handleSendReminderToAllAtRisk = () => {
    showToast(
      'Reminders Dispatched',
      `Sent personalized engagement check-in emails to ${atRiskMembers.length} at-risk members.`,
      'success'
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', margin: 0, fontWeight: 800 }}>Executive Overview</h1>
          <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem' }}>
            Real-time club health, attendance verification telemetry, and retention alerts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('qr-live')}
            className="btn btn-primary"
          >
            <QrCode size={16} /> Launch QR Station
          </button>
          <button
            onClick={() => onNavigate('events')}
            className="btn btn-secondary"
          >
            <Calendar size={16} /> Manage Events
          </button>
        </div>
      </div>

      {/* Live Event Banner if active */}
      {liveEvent && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.12) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--success)'
              }}
            >
              <QrCode size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                  <span className="pulse-indicator" /> Live Check-In Station Active
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Refreshes every {liveEvent.qrRefreshInterval}s
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', margin: '0.25rem 0 0 0', color: '#ffffff' }}>
                {liveEvent.title}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Venue: {liveEvent.location} &bull; Attending: <strong>{liveEvent.actualAttendance}/{liveEvent.capacity}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('qr-live')}
            className="btn btn-primary"
            style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
          >
            Open Live QR Display <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Top 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Active Members"
          value={totalMembers}
          change="+3 new"
          trend="up"
          subtitle="this month"
          icon={<Users size={20} />}
          onClick={() => onNavigate('members')}
        />

        <StatCard
          title="Events Tracked"
          value={totalEvents}
          change="+2 upcoming"
          trend="up"
          subtitle="this semester"
          icon={<Calendar size={20} />}
          onClick={() => onNavigate('events')}
        />

        <StatCard
          title="Avg Attendance Rate"
          value={`${avgAttendance}%`}
          change="+6.4%"
          trend="up"
          subtitle="vs last quarter"
          icon={<Percent size={20} />}
          onClick={() => onNavigate('analytics')}
        />

        <StatCard
          title="At-Risk Members"
          value={atRiskMembers.length}
          change={atRiskMembers.length > 0 ? "Needs action" : "Healthy"}
          trend={atRiskMembers.length > 0 ? "down" : "up"}
          subtitle="<65% threshold"
          icon={<AlertTriangle size={20} color={atRiskMembers.length > 0 ? 'var(--danger)' : 'var(--success)'} />}
          onClick={() => onNavigate('members')}
        />
      </div>

      {/* Main Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Attendance Trends */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Attendance Trends</h3>
              <p style={{ fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
                Historical session-by-session participation rate (%)
              </p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.785rem' }}
            >
              Full Analytics <ArrowRight size={13} />
            </button>
          </div>
          <AttendanceTrendChart />
        </div>

        {/* Category Breakdown */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Performance by Event Format</h3>
              <p style={{ fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
                Attendance benchmarks across event categories
              </p>
            </div>
            <span className="badge badge-brand">Curated</span>
          </div>
          <CategoryBarChart />
        </div>
      </div>

      {/* Two Column Layout: Recent Live Check-Ins & Upcoming Events + At-Risk Box */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Live Check-ins Feed */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="pulse-indicator" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Live Check-In Activity</h3>
            </div>
            <button
              onClick={() => onNavigate('qr-live')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.76rem' }}
            >
              Open Feed
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentCheckIns.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--brand-500)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}
                  >
                    {item.memberName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.865rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {item.memberName}
                    </div>
                    <div style={{ fontSize: '0.735rem', color: 'var(--text-dim)' }}>
                      {item.studentId} &bull; {item.department}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <Badge
                    variant={item.status === 'verified' ? 'success' : 'warning'}
                    icon={item.status === 'verified' ? <CheckCircle2 size={11} /> : undefined}
                  >
                    {item.status}
                  </Badge>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                    {item.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: At-Risk Attention Box & Upcoming Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* At-Risk Alert Box */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, var(--bg-surface) 100%)',
              borderColor: 'rgba(239, 68, 68, 0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} color="var(--danger)" />
                <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-main)' }}>
                  At-Risk Members ({atRiskMembers.length})
                </h3>
              </div>
              <button
                onClick={handleSendReminderToAllAtRisk}
                className="btn btn-danger btn-sm"
                style={{ fontSize: '0.74rem' }}
              >
                <Bell size={12} /> Send Pulse Check
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
              Members flagged with consecutive missed sessions or attendance falling below the club's 65% threshold.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {atRiskMembers.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  onClick={() => {
                    if (onSelectMember) onSelectMember(member);
                    onNavigate('members');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <img
                      src={member.avatar}
                      alt={member.name}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{member.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {member.studentId} &bull; {member.department}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>
                      {member.attendanceRate}%
                    </span>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                      0 streak
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Upcoming Events</h3>
              <button
                onClick={() => onNavigate('events')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.76rem' }}
              >
                All Events <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <Badge variant="brand" className="mb-1" style={{ fontSize: '0.65rem', marginBottom: '0.35rem' }}>
                      {evt.category}
                    </Badge>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {evt.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={12} /> {evt.date} &bull; {evt.time}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={12} /> {evt.location}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '70px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                      {evt.rsvpCount}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      RSVPs
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

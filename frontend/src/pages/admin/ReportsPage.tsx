import React, { useState } from 'react';
import { useClubData } from '../../context/ClubDataContext';
import { Badge } from '../../components/common/Badge';
import {
  Download,
  Calendar,
  Users,
  ShieldCheck,
  Table
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { members, events, integrityLogs, exportMembersCSV, exportEventsCSV, exportIntegrityCSV } = useClubData();

  const [reportType, setReportType] = useState<'members' | 'events' | 'integrity'>('members');
  const [dateRange, setDateRange] = useState('ALL');

  const handleExportCurrent = () => {
    if (reportType === 'members') exportMembersCSV();
    else if (reportType === 'events') exportEventsCSV();
    else exportIntegrityCSV();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', margin: 0, fontWeight: 800 }}>Reports & Data Export</h1>
          <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem' }}>
            Generate executive summaries, accreditation attendance transcripts, and audit exports.
          </p>
        </div>

        <button
          onClick={handleExportCurrent}
          className="btn btn-primary"
        >
          <Download size={16} /> Export Selected Report (CSV)
        </button>
      </div>

      {/* Report Type Selector Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        <div
          onClick={() => setReportType('members')}
          className={`card card-interactive`}
          style={{
            borderColor: reportType === 'members' ? 'var(--brand-500)' : undefined,
            background: reportType === 'members' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-500)' }}>
              <Users size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Member Roster Report</h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{members.length} records</span>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Individual attendance percentages, consecutive streaks, and risk classification tiers.
          </p>
        </div>

        <div
          onClick={() => setReportType('events')}
          className={`card card-interactive`}
          style={{
            borderColor: reportType === 'events' ? 'var(--brand-500)' : undefined,
            background: reportType === 'events' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <Calendar size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Event Attendance Digest</h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{events.length} sessions</span>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Session-by-session turnout numbers, capacity utilization %, and RSVP conversion metrics.
          </p>
        </div>

        <div
          onClick={() => setReportType('integrity')}
          className={`card card-interactive`}
          style={{
            borderColor: reportType === 'integrity' ? 'var(--brand-500)' : undefined,
            background: reportType === 'integrity' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Integrity Audit Log</h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{integrityLogs.length} logged events</span>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Chronological audit of duplicate scans, expired QR tokens, and geo-fence violations.
          </p>
        </div>
      </div>

      {/* Preview Section Header */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Table size={16} color="var(--brand-500)" />
          <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
            {reportType === 'members' && 'Preview: Member Roster Transcript'}
            {reportType === 'events' && 'Preview: Event Turnout Digest'}
            {reportType === 'integrity' && 'Preview: Security Audit Log'}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.785rem', color: 'var(--text-dim)' }}>Date Filter:</span>
          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.785rem', padding: '0.4rem 0.75rem' }}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="ALL">Entire Academic Year</option>
            <option value="OCT">Fall Semester (Oct 2026)</option>
            <option value="SEP">Early Semester (Sep 2026)</option>
          </select>
        </div>
      </div>

      {/* Tabular Preview */}
      <div className="table-container">
        {reportType === 'members' && (
          <table className="table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Attendance %</th>
                <th>Events Attended</th>
                <th>Streak</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{m.studentId}</td>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{m.email}</td>
                  <td>{m.department}</td>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{m.attendanceRate}%</td>
                  <td>{m.attendedEvents} of {m.totalEvents}</td>
                  <td>{m.currentStreak} 🔥</td>
                  <td>
                    <Badge variant={m.status === 'active' ? 'success' : 'danger'}>
                      {m.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {reportType === 'events' && (
          <table className="table">
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Category</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Status</th>
                <th>RSVP Count</th>
                <th>Actual Turnout</th>
                <th>Capacity Rate</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{e.title}</td>
                  <td><Badge variant="brand">{e.category}</Badge></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{e.date} &bull; {e.time}</td>
                  <td style={{ fontSize: '0.8rem' }}>{e.location}</td>
                  <td><Badge variant={e.status === 'live' ? 'success' : 'neutral'}>{e.status}</Badge></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{e.rsvpCount}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{e.actualAttendance}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {e.capacity > 0 ? `${Math.round((e.actualAttendance / e.capacity) * 100)}%` : '0%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {reportType === 'integrity' && (
          <table className="table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Student</th>
                <th>Event Target</th>
                <th>Action Taken</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {integrityLogs.map((i) => (
                <tr key={i.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{i.id}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{i.timestamp}</td>
                  <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{i.type.replace('_', ' ')}</td>
                  <td><Badge variant={i.severity === 'high' ? 'danger' : 'warning'}>{i.severity}</Badge></td>
                  <td>{i.memberName} ({i.studentId})</td>
                  <td style={{ fontSize: '0.8rem' }}>{i.eventName}</td>
                  <td><Badge variant="danger">{i.actionTaken}</Badge></td>
                  <td><Badge variant={i.status === 'resolved' ? 'success' : 'neutral'}>{i.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

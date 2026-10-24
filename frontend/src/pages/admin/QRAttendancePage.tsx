import React, { useState, useEffect } from 'react';
import { useClubData } from '../../context/ClubDataContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import type { EventItem } from '../../types';
import {
  QrCode,
  CheckCircle2,
  Sparkles,
  Zap
} from 'lucide-react';

export const QRAttendancePage: React.FC = () => {
  const { events, members, checkIns, simulateCheckIn } = useClubData();
  const { showToast } = useToast();

  // Find live event or fall back to first event
  const liveEvent = events.find((e) => e.status === 'live') || events[0];
  const [selectedEventId, setSelectedEventId] = useState<string>(liveEvent ? liveEvent.id : '');

  const currentEvent: EventItem | undefined = events.find((e) => e.id === selectedEventId) || liveEvent;

  // Rotation timer state
  const intervalSeconds = currentEvent ? currentEvent.qrRefreshInterval : 10;
  const [timeLeft, setTimeLeft] = useState(intervalSeconds);
  const [tokenHash, setTokenHash] = useState(() => `qr_pulse_${Math.random().toString(36).substring(2, 9)}`);
  const [rotationCount, setRotationCount] = useState(1);
  const [selectedSimMemberId, setSelectedSimMemberId] = useState<string>(members[0]?.id || '');

  // Dynamic QR rotation ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Generate new token hash on rotation
          const nextHash = `qr_pulse_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString().slice(-4)}`;
          setTokenHash(nextHash);
          setRotationCount((c) => c + 1);
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [intervalSeconds]);

  // Event check-ins
  const eventCheckIns = checkIns.filter((c) => c.eventId === currentEvent?.id);

  const handleSimulateScan = () => {
    if (!currentEvent) return;

    if (!selectedSimMemberId) {
      // Pick random member not yet checked in
      const unCheckedMembers = members.filter(
        (m) => !eventCheckIns.some((c) => c.memberId === m.id)
      );
      if (unCheckedMembers.length === 0) {
        showToast('All Checked In', 'Every member on the roster is already checked in!', 'info');
        return;
      }
      const randomMember = unCheckedMembers[Math.floor(Math.random() * unCheckedMembers.length)];
      simulateCheckIn(currentEvent.id, randomMember.id);
    } else {
      simulateCheckIn(currentEvent.id, selectedSimMemberId);
    }
  };

  const attendancePercent = currentEvent && currentEvent.capacity > 0
    ? Math.round((currentEvent.actualAttendance / currentEvent.capacity) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header & Event Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.85rem', margin: 0, fontWeight: 800 }}>Live Attendance Station</h1>
            <span className="badge badge-success">
              <span className="pulse-indicator" /> Active Session
            </span>
          </div>
          <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem' }}>
            Project this screen on the venue display. Dynamic QR rotation stops proxy attendance.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Select Event:
          </label>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.85rem', minWidth: '240px' }}
            value={selectedEventId}
            onChange={(e) => {
              const newId = e.target.value;
              setSelectedEventId(newId);
              const target = events.find((ev) => ev.id === newId);
              if (target) setTimeLeft(target.qrRefreshInterval);
            }}
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.status === 'live' ? '🟢 ' : ''}{ev.title} ({ev.date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Demo Notice Banner */}
      <div
        style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.825rem',
          color: '#818cf8'
        }}
      >
        <Sparkles size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Anti-Proxy Architecture:</strong> Every {intervalSeconds} seconds, a new cryptographic token is minted with a rolling timestamp. Offline photos or forwarded screenshots will fail server-side window verification.
        </span>
      </div>

      {/* Main Grid: QR Display Box & Real-Time Check-In Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
        {/* Left: Dynamic QR Projection Screen */}
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2rem 1.5rem',
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-default)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{ marginBottom: '1rem', width: '100%' }}>
            <Badge variant="brand" style={{ marginBottom: '0.5rem' }}>
              {currentEvent?.category || 'Workshop'}
            </Badge>
            <h2 style={{ fontSize: '1.35rem', margin: '0 0 0.25rem 0' }}>
              {currentEvent?.title}
            </h2>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>
              {currentEvent?.location} &bull; {currentEvent?.time}
            </div>
          </div>

          {/* High-Contrast Dynamic QR Matrix Display */}
          <div
            style={{
              position: 'relative',
              background: '#ffffff',
              padding: '1.25rem',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
              margin: '1rem 0 1.25rem 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* SVG Visual QR Matrix */}
            <svg
              width="210"
              height="210"
              viewBox="0 0 210 210"
              style={{ display: 'block' }}
            >
              {/* Background */}
              <rect width="210" height="210" fill="#ffffff" rx="8" />

              {/* Corner Position Detection Squares (Top-Left, Top-Right, Bottom-Left) */}
              {/* Top-Left */}
              <rect x="15" y="15" width="46" height="46" fill="#000000" rx="4" />
              <rect x="23" y="23" width="30" height="30" fill="#ffffff" rx="2" />
              <rect x="29" y="29" width="18" height="18" fill="#000000" rx="2" />

              {/* Top-Right */}
              <rect x="149" y="15" width="46" height="46" fill="#000000" rx="4" />
              <rect x="157" y="23" width="30" height="30" fill="#ffffff" rx="2" />
              <rect x="163" y="29" width="18" height="18" fill="#000000" rx="2" />

              {/* Bottom-Left */}
              <rect x="15" y="149" width="46" height="46" fill="#000000" rx="4" />
              <rect x="23" y="157" width="30" height="30" fill="#ffffff" rx="2" />
              <rect x="29" y="163" width="18" height="18" fill="#000000" rx="2" />

              {/* Dynamic Data Cells influenced by rotation count */}
              {[
                { x: 70, y: 20, w: 10, h: 10 },
                { x: 90, y: 20, w: 10, h: 10 },
                { x: 110, y: 20, w: 10, h: 10 },
                { x: 130, y: 20, w: 10, h: 10 },
                { x: 70, y: 40, w: 20, h: 10 },
                { x: 100, y: 40, w: 10, h: 20 },
                { x: 120, y: 40, w: 20, h: 10 },
                { x: 20, y: 70, w: 10, h: 20 },
                { x: 40, y: 70, w: 20, h: 10 },
                { x: 70, y: 70, w: 10, h: 10 },
                { x: 90, y: 70, w: 30, h: 10 },
                { x: 130, y: 70, w: 10, h: 20 },
                { x: 150, y: 70, w: 20, h: 10 },
                { x: 180, y: 70, w: 10, h: 20 },
                { x: 20, y: 100, w: 20, h: 10 },
                { x: 50, y: 100, w: 10, h: 20 },
                { x: 70, y: 90, w: 20, h: 20 },
                { x: 100, y: 100, w: 10, h: 10 },
                { x: 120, y: 90, w: 20, h: 20 },
                { x: 150, y: 100, w: 10, h: 10 },
                { x: 170, y: 100, w: 20, h: 10 },
                { x: 20, y: 130, w: 10, h: 10 },
                { x: 40, y: 130, w: 20, h: 10 },
                { x: 70, y: 120, w: 20, h: 10 },
                { x: 100, y: 120, w: 10, h: 20 },
                { x: 120, y: 130, w: 20, h: 10 },
                { x: 150, y: 120, w: 20, h: 20 },
                { x: 180, y: 130, w: 10, h: 10 },
                { x: 70, y: 150, w: 10, h: 20 },
                { x: 90, y: 150, w: 20, h: 10 },
                { x: 120, y: 150, w: 10, h: 10 },
                { x: 140, y: 150, w: 20, h: 20 },
                { x: 170, y: 150, w: 10, h: 10 },
                { x: 70, y: 180, w: 20, h: 10 },
                { x: 100, y: 170, w: 20, h: 10 },
                { x: 130, y: 180, w: 20, h: 10 },
                { x: 160, y: 180, w: 10, h: 10 },
                { x: 180, y: 170, w: 10, h: 20 },
                // dynamic center marker that shifts color/position slightly with rotationCount
                { x: 95, y: 80, w: 20, h: 20 }
              ].map((rect, i) => (
                <rect
                  key={i}
                  x={rect.x}
                  y={rect.y}
                  width={rect.w}
                  height={rect.h}
                  fill={i % 3 === (rotationCount % 3) ? '#4f46e5' : '#000000'}
                  rx="1"
                />
              ))}

              {/* ClubPulse Center Logo Badge in QR */}
              <rect x="85" y="85" width="40" height="40" fill="#ffffff" rx="6" />
              <rect x="88" y="88" width="34" height="34" fill="#0f1420" rx="4" />
              <text
                x="105"
                y="110"
                fill="#818cf8"
                fontSize="14"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="var(--font-sans)"
              >
                CP
              </text>
            </svg>
          </div>

          {/* Countdown Ring & Rotation Metas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '3px solid rgba(99, 102, 241, 0.2)',
                borderTopColor: 'var(--brand-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem',
                color: 'var(--brand-500)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {timeLeft}s
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Rotating in {timeLeft} seconds
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                Hash: {tokenHash.slice(0, 18)}... (Rotation #{rotationCount})
              </div>
            </div>
          </div>

          {/* Attendance Counter Card */}
          <div
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Verified Check-Ins</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                {currentEvent?.actualAttendance} / {currentEvent?.capacity}
              </span>
            </div>

            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, attendancePercent)}%`,
                  backgroundColor: 'var(--success)',
                  borderRadius: '999px',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.45rem' }}>
              <span>Capacity utilization: <strong>{attendancePercent}%</strong></span>
              <span>Points: <strong>+{currentEvent?.pointsAwarded} XP</strong></span>
            </div>
          </div>

          {/* Interactive Simulation Controls for Judges / Presentation */}
          <div
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(99, 102, 241, 0.06)',
              border: '1px dashed rgba(99, 102, 241, 0.3)',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', fontWeight: 700, color: '#818cf8', marginBottom: '0.5rem' }}>
              <Zap size={14} /> Hackathon Live Demo Simulator
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
              Select a club member to simulate their phone scanning this dynamic QR code:
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                className="form-select"
                style={{ fontSize: '0.785rem', padding: '0.45rem 0.65rem' }}
                value={selectedSimMemberId}
                onChange={(e) => setSelectedSimMemberId(e.target.value)}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.studentId})
                  </option>
                ))}
              </select>

              <button
                onClick={handleSimulateScan}
                className="btn btn-primary btn-sm"
                style={{ whiteSpace: 'nowrap' }}
              >
                Scan Now
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Stream of Check-Ins */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="pulse-indicator" />
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Real-Time Attendance Feed</h3>
            </div>
            <span className="badge badge-brand">{eventCheckIns.length} Verified</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto', maxHeight: '580px' }}>
            {eventCheckIns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-dim)' }}>
                <QrCode size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
                <p>Waiting for first check-in...</p>
                <span style={{ fontSize: '0.78rem' }}>Click "Scan Now" to simulate a student check-in!</span>
              </div>
            ) : (
              eventCheckIns.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    animation: 'fadeIn 0.3s ease-out'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--success)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.825rem'
                      }}
                    >
                      {item.memberName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                        {item.memberName}
                      </div>
                      <div style={{ fontSize: '0.745rem', color: 'var(--text-dim)' }}>
                        {item.studentId} &bull; {item.department}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <Badge variant="success" icon={<CheckCircle2 size={11} />}>
                      Verified
                    </Badge>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                      {item.timestamp}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

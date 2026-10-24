import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useClubData } from '../../context/ClubDataContext';
import { Badge } from '../../components/common/Badge';
import { QRScanner } from '../../components/QRScanner';
import {
  generateQrToken,
  scanAttendance,
  AttendanceApiError,
} from '../../api/client';
import type { EventItem, CheckIn } from '../../types';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Keyboard,
  ShieldCheck,
  Send,
  Calendar,
} from 'lucide-react';

interface VerificationResult {
  type: 'success' | 'warning' | 'error';
  title: string;
  detail: string;
  timestamp: string;
}

export const QRAttendancePage: React.FC = () => {
  const { token: authToken, currentUser } = useAuth();
  const { showToast } = useToast();
  const { events, checkIns: contextCheckIns, isLoadingEvents } = useClubData();

  // Selected event state: bound to real backend events
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  useEffect(() => {
    if (events.length > 0 && (!selectedEventId || !events.some((e) => e.id === selectedEventId))) {
      const active = events.find((e) => e.status === 'live') || events[0];
      if (active) {
        setSelectedEventId(active.id);
      }
    }
  }, [events, selectedEventId]);

  const currentEvent: EventItem | undefined = events.find((e) => e.id === selectedEventId) || events[0];

  // Real server QR token & QR data URL
  const [serverToken, setServerToken] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);
  const [qrGenerationError, setQrGenerationError] = useState<string | null>(null);

  // Rotation cadence & countdown (in seconds)
  const intervalSeconds = currentEvent ? currentEvent.qrRefreshInterval : 10;
  const [timeLeft, setTimeLeft] = useState<number>(intervalSeconds);
  const [rotationCount, setRotationCount] = useState<number>(1);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // Attendance scanner & manual submission state
  const [manualToken, setManualToken] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<VerificationResult | null>(null);

  // Verified check-in log from backend
  const [verifiedCheckIns, setVerifiedCheckIns] = useState<CheckIn[]>(() => {
    return contextCheckIns.filter((c) => c.eventId === (currentEvent?.id || '1'));
  });

  // Generate real server QR token from backend endpoint using real numeric event ID
  const fetchServerQrToken = useCallback(async () => {
    if (!authToken) {
      setQrGenerationError('Authentication required to generate QR station.');
      return;
    }

    if (!selectedEventId) {
      return;
    }

    const numericEventId = Number(selectedEventId);
    if (isNaN(numericEventId) || numericEventId <= 0) {
      setQrGenerationError('Please select a valid event.');
      return;
    }

    try {
      setIsGeneratingQr(true);
      setQrGenerationError(null);

      // Endpoint: POST /attendance/qr/:eventId with real numeric event ID
      const response = await generateQrToken(numericEventId, authToken);
      const rawToken = response.token;
      setServerToken(rawToken);

      // Generate a real scannable QR Code image (Data URL) containing the server token
      const dataUrl = await QRCode.toDataURL(rawToken, {
        width: 260,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
      setQrDataUrl(dataUrl);
      setTimeLeft(intervalSeconds);
      setRotationCount((prev) => prev + 1);
    } catch (err: any) {
      const msg = err?.message || 'Failed to generate server QR code.';
      setQrGenerationError(msg);
      showToast('QR Token Error', msg, 'error');
    } finally {
      setIsGeneratingQr(false);
    }
  }, [authToken, selectedEventId, intervalSeconds, showToast]);

  // Initial token fetch & whenever event changes
  useEffect(() => {
    if (selectedEventId) {
      fetchServerQrToken();
    }
  }, [selectedEventId, fetchServerQrToken]);

  // Countdown timer for automatic rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchServerQrToken();
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchServerQrToken, intervalSeconds]);

  // Copy token handler
  const handleCopyToken = () => {
    if (!serverToken) return;
    navigator.clipboard.writeText(serverToken);
    setCopiedToken(true);
    showToast('Token Copied', 'Active server JWT token copied to clipboard.', 'info');
    setTimeout(() => setCopiedToken(false), 2500);
  };

  // Submit token to backend attendance endpoint
  const processAttendanceToken = async (tokenToSubmit: string, source: 'scanner' | 'manual') => {
    const trimmed = (tokenToSubmit || '').trim();
    if (!trimmed) {
      showToast('Validation Error', 'Please scan or enter a valid QR token.', 'warning');
      return;
    }

    if (!authToken) {
      showToast('Auth Error', 'You must be logged in to record attendance.', 'error');
      return;
    }

    setIsSubmitting(true);
    const timeStr = new Date().toLocaleTimeString();

    try {
      // POST /attendance/scan
      // Source of truth: backend response only!
      const data = await scanAttendance(trimmed, authToken);

      const verifiedRecord: CheckIn = {
        id: `chk-${data.attendance?.id || Date.now().toString(36)}`,
        eventId: selectedEventId,
        eventName: currentEvent?.title || 'Club Event',
        memberId: String(data.attendance?.user?.id || currentUser?.id || 'mem-1'),
        memberName: data.attendance?.user?.name || currentUser?.name || 'Verified Member',
        studentId: currentUser?.studentId || 'CP-CURRENT',
        department: currentUser?.department || 'Member',
        timestamp: timeStr,
        method: source === 'scanner' ? 'dynamic_qr' : 'manual_override',
        status: 'verified',
        tokenHash: trimmed.substring(0, 16) + '...',
      };

      // Add to verified check-ins list
      setVerifiedCheckIns((prev) => [verifiedRecord, ...prev]);

      const successResult: VerificationResult = {
        type: 'success',
        title: 'Attendance Confirmed!',
        detail: `Server verified attendance for ${verifiedRecord.memberName} (${verifiedRecord.studentId}) via ${source === 'scanner' ? 'camera scan' : 'manual entry'}.`,
        timestamp: timeStr,
      };
      setLastResult(successResult);
      showToast('Success', 'Attendance recorded successfully', 'success');

      if (source === 'manual') {
        setManualToken('');
      }
    } catch (err: any) {
      const code = err instanceof AttendanceApiError ? err.code : 'UNKNOWN';
      const errorMsg = err?.message || 'Failed to record attendance.';

      if (code === 'DUPLICATE_ATTENDANCE') {
        const warningResult: VerificationResult = {
          type: 'warning',
          title: 'Duplicate Attendance Scan',
          detail: 'You have already marked attendance for this event. Duplicate check-in was rejected by the server.',
          timestamp: timeStr,
        };
        setLastResult(warningResult);
        showToast('Duplicate Scan', 'Already marked attendance for this event', 'warning');
      } else if (code === 'EXPIRED_TOKEN') {
        const errorResult: VerificationResult = {
          type: 'error',
          title: 'Expired QR Token',
          detail: 'The scanned token has expired on the server. Please scan the current active QR code.',
          timestamp: timeStr,
        };
        setLastResult(errorResult);
        showToast('Expired Token', 'This QR code has expired', 'error');
      } else if (code === 'INVALID_TOKEN') {
        const errorResult: VerificationResult = {
          type: 'error',
          title: 'Invalid QR Token',
          detail: 'The submitted QR token is malformed, unrecognized, or untrusted by the server.',
          timestamp: timeStr,
        };
        setLastResult(errorResult);
        showToast('Invalid QR', errorMsg, 'error');
      } else {
        const errorResult: VerificationResult = {
          type: 'error',
          title: 'Attendance Verification Failed',
          detail: errorMsg,
          timestamp: timeStr,
        };
        setLastResult(errorResult);
        showToast('Error', errorMsg, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanSuccess = async (scannedText: string) => {
    await processAttendanceToken(scannedText, 'scanner');
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    await processAttendanceToken(manualToken, 'manual');
  };

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
          <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Project this screen on the venue display. Dynamic server QR rotation prevents attendance fraud.
          </p>
        </div>

        {events.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label htmlFor="event-selector" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Select Event:
            </label>
            <select
              id="event-selector"
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
                  {ev.status === 'live' ? '🟢 ' : ''}[#{ev.id}] {ev.title} ({ev.date})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* No Events Empty State */}
      {!isLoadingEvents && events.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-dim)' }}>
          <Calendar size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.35 }} />
          <h3 style={{ fontSize: '1.15rem', margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontWeight: 700 }}>
            No Scheduled Events Found
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
            Create an event in the Event Hub to broadcast a live QR code station and scan member attendance.
          </p>
        </div>
      )}

      {/* Main Two-Column Layout */}
      {events.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 460px) 1fr', gap: '1.75rem', alignItems: 'start' }}>
          {/* Left Column: Real Server QR Generation + Camera Scanner & Fallback */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Card: Dynamic Server QR Broadcaster */}
            <div className="card" style={{ textAlign: 'center', padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--brand-400)', fontWeight: 700 }}>
                  <ShieldCheck size={16} /> Server QR Token (Event #{currentEvent?.id})
                </div>
                <span className="badge badge-brand">Rotation #{rotationCount}</span>
              </div>

              <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.35rem 0', fontWeight: 700 }}>
                {currentEvent?.title || 'Club Session'}
              </h3>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                Venue: {currentEvent?.location || 'Main Auditorium'} &bull; Scan using phone camera
              </p>

              {/* REAL Scannable QR Code Canvas / Image Display */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
                  margin: '0.5rem 0 1rem 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '260px',
                  minWidth: '260px',
                }}
              >
                {isGeneratingQr && !qrDataUrl ? (
                  <div style={{ color: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={32} className="spin" color="#6366f1" />
                    <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>Signing QR Token...</span>
                  </div>
                ) : qrGenerationError ? (
                  <div style={{ color: '#dc2626', padding: '1rem', textAlign: 'center', maxWidth: '240px' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 0.5rem auto' }} />
                    <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>Generation Error</div>
                    <p style={{ fontSize: '0.72rem', margin: '0.25rem 0 0.75rem 0' }}>{qrGenerationError}</p>
                    <button type="button" onClick={fetchServerQrToken} className="btn btn-sm btn-primary">
                      Retry
                    </button>
                  </div>
                ) : qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Server-Generated Event QR Code"
                    style={{ width: '230px', height: '230px', display: 'block', borderRadius: '4px' }}
                  />
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.825rem' }}>No active QR code</div>
                )}
              </div>

              {/* Rotation Countdown & Manual Refresh */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
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
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)',
                    color: timeLeft <= 3 ? '#ef4444' : 'var(--brand-400)',
                  }}
                >
                  {timeLeft}s
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.785rem', fontWeight: 600 }}>Auto-Refreshing QR Token</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Server JWT rotates every {intervalSeconds}s
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchServerQrToken}
                  disabled={isGeneratingQr}
                  className="btn btn-secondary btn-sm"
                  style={{ marginLeft: 'auto', padding: '0.35rem 0.65rem' }}
                  title="Force refresh token"
                >
                  <RefreshCw size={13} className={isGeneratingQr ? 'spin' : ''} />
                </button>
              </div>

              {/* Token preview & Copy button for testing */}
              <div
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Server JWT Signature
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '240px',
                    }}
                    title={serverToken}
                  >
                    {serverToken ? `${serverToken.substring(0, 24)}...` : 'Generating...'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyToken}
                  disabled={!serverToken}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.55rem' }}
                  title="Copy token to test manual fallback"
                >
                  {copiedToken ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Card: Real Camera Scanner */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                <QrCode size={16} color="var(--brand-400)" />
                <span>Camera-Based Attendance Scanner</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', lineHeight: 1.4 }}>
                Point the device camera at an attendee&apos;s digital pass or dynamic event QR code. The token is submitted directly to the backend for cryptographic validation.
              </p>

              <QRScanner onScanSuccess={handleScanSuccess} isProcessing={isSubmitting} />

              {/* Server Verification Result Box */}
              {lastResult && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background:
                      lastResult.type === 'success'
                        ? 'rgba(16, 185, 129, 0.1)'
                        : lastResult.type === 'warning'
                        ? 'rgba(245, 158, 11, 0.1)'
                        : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${
                      lastResult.type === 'success'
                        ? 'rgba(16, 185, 129, 0.3)'
                        : lastResult.type === 'warning'
                        ? 'rgba(245, 158, 11, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)'
                    }`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                    {lastResult.type === 'success' && <CheckCircle2 size={15} color="var(--success)" />}
                    {lastResult.type === 'warning' && <AlertTriangle size={15} color="#f59e0b" />}
                    {lastResult.type === 'error' && <AlertCircle size={15} color="#ef4444" />}
                    <span
                      style={{
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        color:
                          lastResult.type === 'success'
                            ? 'var(--success)'
                            : lastResult.type === 'warning'
                            ? '#f59e0b'
                            : '#ef4444',
                      }}
                    >
                      {lastResult.title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                      {lastResult.timestamp}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                    {lastResult.detail}
                  </p>
                </div>
              )}
            </div>

            {/* Card: Clearly Labelled Manual Token Entry Fallback */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                <Keyboard size={16} color="var(--brand-400)" />
                <span>Manual Token Entry Fallback</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.85rem 0', lineHeight: 1.4 }}>
                If camera access is unavailable or denied, paste or type the QR JWT token manually to submit to the backend attendance validation endpoint.
              </p>

              <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', flex: 1 }}
                  placeholder="Enter QR token manually (e.g. eyJhbGci...)"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={!manualToken.trim() || isSubmitting}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
                >
                  {isSubmitting ? (
                    <RefreshCw size={13} className="spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  <span>Submit</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Real-Time Verified Attendance Feed */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="pulse-indicator" />
                <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>Real-Time Attendance Feed</h3>
              </div>
              <span className="badge badge-brand">{verifiedCheckIns.length} Server-Verified</span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                flex: 1,
                overflowY: 'auto',
                maxHeight: '680px',
              }}
            >
              {verifiedCheckIns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-dim)' }}>
                  <QrCode size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>Waiting for verified check-in...</p>
                  <span style={{ fontSize: '0.78rem' }}>
                    Scan a QR code with the camera above or submit a token manually.
                  </span>
                </div>
              ) : (
                verifiedCheckIns.map((item) => (
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
                      animation: 'fadeIn 0.3s ease-out',
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
                          fontSize: '0.825rem',
                        }}
                      >
                        {item.memberName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                          {item.memberName}
                        </div>
                        <div style={{ fontSize: '0.745rem', color: 'var(--text-dim)' }}>
                          {item.studentId} &bull; {item.department} &bull;{' '}
                          <span style={{ color: 'var(--brand-400)' }}>
                            {item.method === 'dynamic_qr' ? 'Camera Scan' : 'Manual Entry'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <Badge variant="success" icon={<CheckCircle2 size={11} />}>
                        Verified
                      </Badge>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-dim)',
                          marginTop: '0.2rem',
                          fontFamily: 'var(--font-mono)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '0.25rem',
                        }}
                      >
                        <Clock size={11} /> {item.timestamp}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '../../context/AuthContext';
import { useClubData } from '../../context/ClubDataContext';
import { Badge } from '../../components/common/Badge';
import { ShieldCheck, Copy, Check } from 'lucide-react';

export const UserPassPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { members } = useClubData();

  const student = members.find(
    (member) =>
      member.id === currentUser?.id ||
      member.email === currentUser?.email
  );

  const name = student?.name ?? currentUser?.name ?? 'Student';
  const studentId = student?.studentId ?? currentUser?.studentId ?? 'Not available';
  const department = student?.department ?? currentUser?.department ?? 'Not available';
  const year = student?.year ?? currentUser?.year ?? 'Not available';
  const avatar =
    student?.avatar ??
    currentUser?.avatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;

  const [passQrDataUrl, setPassQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const generateQR = async () => {
      if (!currentUser?.id) {
        setPassQrDataUrl('');
        return;
      }

      try {
        const membershipData = JSON.stringify({
          type: 'clubpulse-member-pass',
          userId: currentUser.id,
          studentId: studentId,
        });

        const dataUrl = await QRCode.toDataURL(membershipData, {
          width: 180,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' },
        });

        if (!cancelled) setPassQrDataUrl(dataUrl);
      } catch {
        if (!cancelled) setPassQrDataUrl('');
      }
    };

    generateQR();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, studentId]);

  const handleCopy = async () => {
    setCopyError('');

    try {
      await navigator.clipboard.writeText(studentId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError('Unable to copy. Please copy your student ID manually.');
    }
  };

  if (!currentUser) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        Please log in to view your club pass.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        maxWidth: '640px',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.85rem', margin: 0, fontWeight: 800 }}>
          Digital Club Pass
        </h1>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem' }}>
          Your ClubPulse membership details and QR code.
        </p>
      </div>

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          boxSizing: 'border-box',
          padding: '2rem 1.75rem',
          background:
            'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-secondary) 100%)',
          border: '1px solid var(--border-highlight)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                flexShrink: 0,
                borderRadius: 'var(--radius-md)',
                background: 'var(--brand-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.9rem',
              }}
            >
              CP
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2 }}>
                ClubPulse
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                MEMBERSHIP PASS
              </div>
            </div>
          </div>

          <Badge variant="success" icon={<ShieldCheck size={11} />}>
            Membership
          </Badge>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1.5rem',
          }}
        >
          <img
            src={avatar}
            alt={name}
            onError={(event) => {
              event.currentTarget.src =
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
            }}
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--brand-500)',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.35)',
            }}
          />

          <div>
            <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.15rem' }}>
              {name}
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {studentId} &bull; {department}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              {year} &bull; {currentUser.tier ?? 'Member'}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '180px',
            minWidth: '180px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            marginBottom: '1rem',
          }}
        >
          {passQrDataUrl ? (
            <img
              src={passQrDataUrl}
              alt="ClubPulse membership QR code"
              style={{ width: '180px', height: '180px', display: 'block' }}
            />
          ) : (
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
              {currentUser.id ? 'Generating membership QR…' : 'User ID unavailable'}
            </div>
          )}
        </div>

        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-dim)',
            lineHeight: 1.5,
            margin: '0 0 1rem',
          }}
        >
          This QR identifies your membership. It does not record attendance.
          Scan the event’s official attendance QR to check in.
        </p>

        <button
          onClick={handleCopy}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', fontSize: '0.78rem' }}
          disabled={studentId === 'Not available'}
        >
          {copied ? (
            <>
              <Check size={14} color="var(--success)" /> Student ID Copied
            </>
          ) : (
            <>
              <Copy size={14} /> Copy Student ID
            </>
          )}
        </button>

        {copyError && (
          <p style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>
            {copyError}
          </p>
        )}
      </div>
    </div>
  );
};
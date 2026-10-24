import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '../../context/AuthContext';
import { useClubData } from '../../context/ClubDataContext';
import { Badge } from '../../components/common/Badge';
import {
  ShieldCheck,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

export const UserPassPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { members } = useClubData();

  const student = members.find((m) => m.name === currentUser?.name) || members[0];
  const [tokenTime, setTokenTime] = useState(15);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setTokenTime((prev) => (prev <= 1 ? 15 : prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const passToken = `CP_PASS_${student.studentId}_${student.id.toUpperCase()}_AUTH`;
  const [passQrDataUrl, setPassQrDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(passToken, {
      width: 180,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    }).then(setPassQrDataUrl).catch(console.error);
  }, [passToken]);

  const handleCopy = () => {
    navigator.clipboard.writeText(passToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', margin: 0, fontWeight: 800 }}>Digital Club Pass</h1>
        <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem' }}>
          Present this credential QR code at club events or workshop registration desks.
        </p>
      </div>

      {/* High-End Digital Pass Card */}
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2rem 1.75rem',
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-secondary) 100%)',
          border: '1px solid var(--border-highlight)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Glow backdrop */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--brand-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.9rem'
              }}
            >
              CP
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2 }}>ClubPulse</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>OFFICIAL PASS</div>
            </div>
          </div>

          <Badge variant="success" icon={<ShieldCheck size={11} />}>
            Verified Student
          </Badge>
        </div>

        {/* Student Avatar & Identity */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <img
            src={student.avatar}
            alt={student.name}
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--brand-500)',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.35)'
            }}
          />
          <div>
            <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.15rem 0' }}>{student.name}</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {student.studentId} &bull; {student.department}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              {student.year} &bull; {currentUser?.tier || 'Gold Member'}
            </div>
          </div>
        </div>

        {/* Visual QR Code Display */}
        <div
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
            marginBottom: '1.25rem',
            minHeight: '180px',
            minWidth: '180px',
          }}
        >
          {passQrDataUrl ? (
            <img
              src={passQrDataUrl}
              alt="Digital Club Pass QR Code"
              style={{ width: '180px', height: '180px', display: 'block', borderRadius: '4px' }}
            />
          ) : (
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Generating Pass QR...</div>
          )}
        </div>

        {/* Rolling Refresh Notice */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.785rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
          <RefreshCw size={12} className="pulse-indicator" />
          <span>Dynamic cryptographic refresh: <strong>{tokenTime}s remaining</strong></span>
        </div>

        {/* Copy Token Button */}
        <button
          onClick={handleCopy}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', fontSize: '0.78rem' }}
        >
          {copied ? (
            <>
              <Check size={14} color="var(--success)" /> Token Copied to Clipboard
            </>
          ) : (
            <>
              <Copy size={14} /> Copy Pass Signature Hash
            </>
          )}
        </button>
      </div>
    </div>
  );
};

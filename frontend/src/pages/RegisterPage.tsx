import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { ActivePage } from '../types';
import { ArrowLeft, Lock, Mail } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: ActivePage) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Missing Fields', 'Please enter email and password.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password);
      showToast('Registration Successful', 'Account created! Public accounts receive User role by default.', 'success');
    } catch (err: any) {
      showToast('Registration Failed', err.message || 'Error creating account', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '2.25rem',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        <button
          onClick={() => onNavigate('landing')}
          className="btn-ghost"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.2rem 0',
            border: 'none',
            fontSize: '0.8rem',
            marginBottom: '1.25rem',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={14} /> Back to Landing
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.45rem', margin: '0 0 0.35rem 0' }}>Join ClubPulse</h2>
          <p style={{ fontSize: '0.85rem' }}>Create a member account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campus.edu"
              />
              <Mail
                size={16}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
              <Lock
                size={16}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.85rem', padding: '0.75rem' }}
          >
            {isLoading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <span
            onClick={() => onNavigate('login')}
            style={{ color: '#818cf8', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Sign in to existing account
          </span>
        </div>
      </div>
    </div>
  );
};

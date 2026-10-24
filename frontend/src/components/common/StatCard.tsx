import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  subtitle?: string;
  badgeText?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  subtitle,
  badgeText,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`card ${onClick ? 'card-interactive' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div>
          <span style={{ fontSize: '0.815rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          {badgeText && (
            <span className="badge badge-brand" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
              {badgeText}
            </span>
          )}
        </div>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-500)'
          }}
        >
          {icon}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '1.95rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
          {value}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.785rem' }}>
          {change && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontWeight: 600,
                color: trend === 'up' ? 'var(--success)' : trend === 'down' ? 'var(--danger)' : 'var(--text-muted)'
              }}
            >
              {trend === 'up' && <TrendingUp size={13} />}
              {trend === 'down' && <TrendingDown size={13} />}
              {trend === 'neutral' && <Minus size={13} />}
              <span>{change}</span>
            </div>
          )}
          {subtitle && (
            <span style={{ color: 'var(--text-dim)' }}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

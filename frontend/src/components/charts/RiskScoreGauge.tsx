import React from 'react';

interface RiskBreakdownProps {
  lowCount: number;
  mediumCount: number;
  highCount: number;
}

export const RiskScoreGauge: React.FC<RiskBreakdownProps> = ({
  lowCount,
  mediumCount,
  highCount
}) => {
  const total = Math.max(1, lowCount + mediumCount + highCount);
  const lowPct = Math.round((lowCount / total) * 100);
  const medPct = Math.round((mediumCount / total) * 100);
  const highPct = 100 - lowPct - medPct;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Segmented Bar */}
      <div
        style={{
          height: '14px',
          width: '100%',
          display: 'flex',
          borderRadius: '999px',
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.05)'
        }}
      >
        <div style={{ width: `${lowPct}%`, backgroundColor: 'var(--success)' }} title={`Low Risk: ${lowCount}`} />
        <div style={{ width: `${medPct}%`, backgroundColor: 'var(--warning)' }} title={`Moderate Risk: ${mediumCount}`} />
        <div style={{ width: `${highPct}%`, backgroundColor: 'var(--danger)' }} title={`High Risk: ${highCount}`} />
      </div>

      {/* Legend & Count Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        <div
          style={{
            padding: '0.75rem',
            background: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>
            {lowCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Low Risk ({lowPct}%)
          </div>
        </div>

        <div
          style={{
            padding: '0.75rem',
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warning)' }}>
            {mediumCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Moderate ({medPct}%)
          </div>
        </div>

        <div
          style={{
            padding: '0.75rem',
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)' }}>
            {highCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            At Risk ({highPct}%)
          </div>
        </div>
      </div>
    </div>
  );
};

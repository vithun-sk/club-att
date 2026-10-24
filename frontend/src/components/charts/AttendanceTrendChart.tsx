import React, { useState } from 'react';

interface DataPoint {
  label: string;
  rate: number;
  attended: number;
  total: number;
}

const DEFAULT_DATA: DataPoint[] = [
  { label: 'Aug W1', rate: 72, attended: 43, total: 60 },
  { label: 'Aug W3', rate: 78, attended: 47, total: 60 },
  { label: 'Sep W1', rate: 82, attended: 57, total: 70 },
  { label: 'Sep W3', rate: 85, attended: 51, total: 60 },
  { label: 'Oct W1', rate: 89, attended: 68, total: 80 },
  { label: 'Oct W2', rate: 91, attended: 84, total: 100 },
  { label: 'Oct W4', rate: 84, attended: 47, total: 65 }
];

export const AttendanceTrendChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 640;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = DEFAULT_DATA.map((d, index) => {
    const x = paddingX + (index / (DEFAULT_DATA.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - ((d.rate - 50) / 50) * chartHeight;
    return { x, y, data: d };
  });

  // Construct SVG path
  const linePath = points.reduce((acc, curr, index) => {
    return `${acc} ${index === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Horizontal grid lines */}
        {[60, 70, 80, 90, 100].map((rate) => {
          const y = paddingY + chartHeight - ((rate - 50) / 50) * chartHeight;
          return (
            <g key={rate}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="rgba(255, 255, 255, 0.07)"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 10}
                y={y + 4}
                fill="var(--text-dim)"
                fontSize="10"
                textAnchor="end"
                fontFamily="var(--font-mono)"
              >
                {rate}%
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        <path d={areaPath} fill="url(#trendGradient)" />

        {/* Smooth Trend Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#6366f1"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points & Interactive Nodes */}
        {points.map((p, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 6 : 4}
                fill="#ffffff"
                stroke="#6366f1"
                strokeWidth={isHovered ? 3 : 2}
                filter={isHovered ? 'url(#glow)' : undefined}
                style={{ transition: 'all 0.15s ease' }}
              />

              {/* X Axis Labels */}
              <text
                x={p.x}
                y={height - 8}
                fill={isHovered ? 'var(--text-main)' : 'var(--text-dim)'}
                fontSize="11"
                textAnchor="middle"
                fontFamily="var(--font-sans)"
                fontWeight={isHovered ? '600' : '400'}
              >
                {p.data.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover Tooltip Overlay */}
      {hoveredIdx !== null && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-highlight)',
            borderRadius: 'var(--radius-md)',
            padding: '0.45rem 0.8rem',
            fontSize: '0.785rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            pointerEvents: 'none'
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>{DEFAULT_DATA[hoveredIdx].label}:</span>
          <span style={{ color: '#818cf8', fontWeight: 700 }}>
            {DEFAULT_DATA[hoveredIdx].rate}% Attendance
          </span>
          <span style={{ color: 'var(--text-dim)' }}>
            ({DEFAULT_DATA[hoveredIdx].attended}/{DEFAULT_DATA[hoveredIdx].total} checked in)
          </span>
        </div>
      )}
    </div>
  );
};

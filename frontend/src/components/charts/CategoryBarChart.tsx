import React from 'react';

interface CategoryData {
  category: string;
  attendanceRate: number;
  count: number;
  color: string;
}

const CATEGORY_STATS: CategoryData[] = [
  { category: 'Workshops', attendanceRate: 86, count: 8, color: '#6366f1' },
  { category: 'Hackathons', attendanceRate: 92, count: 2, color: '#8b5cf6' },
  { category: 'Tech Talks', attendanceRate: 79, count: 4, color: '#06b6d4' },
  { category: 'General Body', attendanceRate: 84, count: 3, color: '#10b981' },
  { category: 'Socials', attendanceRate: 71, count: 1, color: '#f59e0b' }
];

export const CategoryBarChart: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', width: '100%' }}>
      {CATEGORY_STATS.map((item) => (
        <div key={item.category}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.815rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              {item.category}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                {item.count} events
              </span>
              <span style={{ fontWeight: 700, color: item.color, fontFamily: 'var(--font-mono)' }}>
                {item.attendanceRate}%
              </span>
            </div>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '999px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${item.attendanceRate}%`,
                height: '100%',
                backgroundColor: item.color,
                borderRadius: '999px',
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

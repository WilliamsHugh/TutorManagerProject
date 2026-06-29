'use client';

import { Icon } from '@iconify/react';

interface TutorStatsRowProps {
  stats: any[];
}

export function TutorStatsRow({ stats }: TutorStatsRowProps) {
  return (
    <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
      {stats.length > 0 ? stats.map((stat, i) => (
        <div key={i} className="stat-card" style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className={`stat-icon ${stat.color}`} style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
            <Icon icon={stat.icon} />
          </div>
          <div className="stat-data" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="stat-label" style={{ fontSize: '13px', color: '#64748b' }}>{stat.label}</span>
            <span className="stat-value text-slate-800" style={{ fontSize: '24px', fontWeight: 700 }}>
              {stat.value} {stat.sub && <span style={{ fontSize: '13px', color: '#64748b' }}>{stat.sub}</span>}
            </span>
          </div>
        </div>
      )) : (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          Chưa có dữ liệu thống kê.
        </div>
      )}
    </div>
  );
}

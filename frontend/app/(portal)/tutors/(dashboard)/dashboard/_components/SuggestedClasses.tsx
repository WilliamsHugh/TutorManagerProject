'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';

interface SuggestedClassesProps {
  suggestedClasses: any[];
  onShowDetail: (id: string) => void;
}

export function SuggestedClasses({ suggestedClasses, onShowDetail }: SuggestedClassesProps) {
  return (
    <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
        <h2 className="card-title" style={{ fontSize: '16px', fontWeight: 600 }}>Lớp học mới gợi ý</h2>
        <Link href="/tutors/new-classes" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>Xem tất cả</Link>
      </div>
      <div className="suggested-list" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '390px', overflowY: 'auto' }}>
        {suggestedClasses.length > 0 ? suggestedClasses.map((cls, i) => (
          <div key={i} className="s-item" style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }} className="text-slate-800">{cls.subject}</span>
              {cls.isNew && <span style={{ background: '#fef08a', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }} className="text-slate-900 font-bold">MỚI</span>}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon icon="lucide:map-pin" /> {cls.location}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon icon="lucide:calendar-clock" /> {cls.schedule}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon icon="lucide:banknote" /> {cls.price}</div>
            </div>
            <button 
              onClick={() => onShowDetail(cls.id)}
              style={{ width: '100%', marginTop: '12px', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'none', cursor: 'pointer' }}
              className="hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700"
            >
              Xem chi tiết
            </button>
          </div>
        )) : (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>Chưa có lớp học gợi ý lúc này.</div>
        )}
      </div>
    </div>
  );
}

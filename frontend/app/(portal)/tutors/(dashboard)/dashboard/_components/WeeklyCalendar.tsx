'use client';

import { Icon } from '@iconify/react';

interface WeeklyCalendarProps {
  calendar: any[];
  isUpdating: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  weekRangeLabel: string;
}

export function WeeklyCalendar({
  calendar,
  isUpdating,
  onPrevWeek,
  onNextWeek,
  weekRangeLabel,
}: WeeklyCalendarProps) {
  return (
    <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 className="card-title" style={{ fontSize: '16px', fontWeight: 600 }}>Lịch dạy tuần này</h2>
          {isUpdating && <Icon icon="lucide:loader-2" className="animate-spin text-blue-600" fontSize={16} />}
        </div>
        
        <div className="card-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onPrevWeek}
            style={{ border: '1px solid #e2e8f0', background: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
            className="hover:bg-slate-50 transition-colors text-slate-700"
          >
            <Icon icon="lucide:chevron-left" />
          </button>
          <span style={{ fontSize: '13px', fontWeight: 500 }} className="text-slate-700">{weekRangeLabel}</span>
          <button 
            onClick={onNextWeek}
            style={{ border: '1px solid #e2e8f0', background: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
            className="hover:bg-slate-50 transition-colors text-slate-700"
          >
            <Icon icon="lucide:chevron-right" />
          </button>
        </div>
      </div>
      <div 
        className="calendar-container" 
        style={{ 
          padding: '24px', 
          opacity: isUpdating ? 0.6 : 1, 
          transition: 'opacity 0.2s ease-in-out' 
        }}
      >
        {calendar.length > 0 ? (
          <div className="calendar-days" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
            {calendar.map((item, i) => (
              <div key={i} className={`c-day ${item.isToday ? 'today' : ''}`} style={{ background: item.isToday ? '#eff6ff' : '#f1f5f9', padding: '12px', borderRadius: '6px', minHeight: '180px' }}>
                <div className="c-day-header" style={{ textAlign: 'center', borderBottom: '1px dashed #e2e8f0', marginBottom: '12px', paddingBottom: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{item.day}</div>
                  <div style={{ fontSize: '18px', fontWeight: 600 }} className="text-slate-800">{item.date}</div>
                </div>
                {item.events && item.events.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {item.events.map((evt: any, idx: number) => (
                      <div 
                        key={idx}
                        className={`event ${evt.color}`} 
                        style={{ padding: '8px', borderRadius: '4px', fontSize: '11px', background: '#dbeafe', borderLeft: '3px solid #3b82f6', cursor: 'pointer' }}
                      >
                        <div style={{ fontWeight: 700 }} className="text-blue-900">{evt.time}</div>
                        <div style={{ fontWeight: 600 }} className="text-blue-800">{evt.title}</div>
                        <div style={{ marginTop: '4px' }} className="text-blue-700">{evt.student}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>Không có lịch dạy nào trong tuần này.</div>
        )}
      </div>
    </div>
  );
}

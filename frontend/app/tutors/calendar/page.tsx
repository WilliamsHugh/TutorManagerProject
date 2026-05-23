'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/tutor/Header';
import { Icon } from '@iconify/react';
import { getTutorSchedule } from '@/lib/api';

export default function CalendarPage() {
  const [calendarData, setCalendarData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!profile) setLoading(true);
        else setIsUpdating(true);

        // Sử dụng local date format để tránh lệch múi giờ khi gửi API
        const dateStr = currentDate.toLocaleDateString('en-CA'); 
        const data = await getTutorSchedule(dateStr, viewMode);
        
        setCalendarData(data);
        setProfile(data.profile);
      } catch (error) {
        console.error("Lỗi tải lịch dạy:", error);
        setCalendarData(null);
      } finally {
        setLoading(false);
        setIsUpdating(false);
      }
    };
    fetchData();
  }, [currentDate, viewMode]);

  const navigateDate = (offset: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + offset);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + offset * 7);
    } else {
      newDate.setDate(currentDate.getDate() + offset);
    }
    setCurrentDate(newDate);
  };

  const getTitle = () => {
    if (viewMode === 'month') return currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    if (viewMode === 'day') return currentDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const d = currentDate.getDay();
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - (d === 0 ? 6 : d - 1));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
  };

  const getMonthDays = () => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const days = [];
    const startDay = start.getDay() || 7;
    for (let i = startDay - 1; i > 0; i--) {
      const d = new Date(start);
      d.setDate(start.getDate() - i);
      days.push({ date: d, currentMonth: false });
    }
    for (let i = 1; i <= end.getDate(); i++) {
      days.push({ date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i), currentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(end);
      d.setDate(end.getDate() + i);
      days.push({ date: d, currentMonth: false });
    }
    return days;
  };

  return (
    <>
      <Header title="Lịch dạy" userProfile={profile} />
      <div className="content" style={{ padding: '32px' }}>
        <div className="calendar-wrapper" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="calendar-header" style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' }}>
            {/* Cụm Toolbar bên trái: Điều hướng & Tiêu đề */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={() => setCurrentDate(new Date())}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >Hôm nay</button>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '8px', padding: '2px', border: '1px solid #e2e8f0' }}>
                <button onClick={() => navigateDate(-1)} style={{ border: 'none', background: 'none', padding: '6px', cursor: 'pointer', display: 'flex', color: '#64748b' }}><Icon icon="lucide:chevron-left" fontSize={20} /></button>
                <button onClick={() => navigateDate(1)} style={{ border: 'none', background: 'none', padding: '6px', cursor: 'pointer', display: 'flex', color: '#64748b' }}><Icon icon="lucide:chevron-right" fontSize={20} /></button>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 8px', color: '#1e293b' }}>{getTitle()}</h2>
              {isUpdating && <Icon icon="lucide:loader-2" className="animate-spin text-blue-600" fontSize={20} />}
            </div>

            {/* Cụm Toolbar bên phải: Chế độ xem & Hành động */}
            <div className="calendar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                {(['month', 'week', 'day'] as const).map(mode => (
                  <button 
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{ 
                      padding: '6px 14px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                      background: viewMode === mode ? '#fff' : 'transparent',
                      boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      color: viewMode === mode ? '#2563eb' : '#64748b',
                      transition: 'all 0.2s'
                    }}
                  >
                    {mode === 'month' ? 'Tháng' : mode === 'week' ? 'Tuần' : 'Ngày'}
                  </button>
                ))}
              </div>
              <button style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', 
                background: '#2563eb', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
              }}>
                <Icon icon="lucide:plus" fontSize={18} /> Tạo lịch nghỉ
              </button>
            </div>
          </div>

          <div className="calendar-body" style={{ opacity: isUpdating ? 0.6 : 1, transition: 'opacity 0.2s' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 64 }}>
                <Icon icon="lucide:loader-2" className="animate-spin" fontSize={32} color="#64748b" />
              </div>
            ) : viewMode === 'week' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e2e8f0' }}>
                {(calendarData?.calendar || []).map((item: any, i: number) => (
                  <div key={i} style={{ borderRight: i < 6 ? '1px solid #e2e8f0' : 'none', minHeight: '500px', background: item.isToday ? '#f0f7ff' : '#fff' }}>
                    <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #f1f5f9', background: item.isToday ? '#eff6ff' : '#f8fafc' }}>
                      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{item.day}</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: item.isToday ? '#2563eb' : '#1e293b' }}>{item.date}</div>
                    </div>
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(item.events || []).map((ev: any, idx: number) => <EventCard key={idx} event={ev} />)}
                      {(!item.events || item.events.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: '#cbd5e1', fontSize: '11px' }}>Trống</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'month' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e2e8f0' }}>
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(h => (
                  <div key={h} style={{ padding: '12px', textAlign: 'center', fontWeight: 700, fontSize: '12px', color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>{h}</div>
                ))}
                {getMonthDays().map((item, i) => {
                  const dayEvents = (calendarData?.events || []).filter((e: any) => 
                    new Date(e.date).toDateString() === item.date.toDateString()
                  );
                  return (
                    <div key={i} style={{ 
                      minHeight: '120px', borderRight: (i + 1) % 7 !== 0 ? '1px solid #f1f5f9' : 'none', 
                      borderBottom: '1px solid #f1f5f9', padding: '8px', background: item.currentMonth ? '#fff' : '#fcfcfd' 
                    }}>
                      <div style={{ 
                        fontSize: '12px', fontWeight: 700, color: item.currentMonth ? '#64748b' : '#cbd5e1', 
                        textAlign: 'right', marginBottom: '4px' 
                      }}>{item.date.getDate()}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {dayEvents.slice(0, 2).map((ev: any, idx: number) => (
                          <div key={idx} style={{ padding: '2px 6px', borderRadius: '4px', background: '#eff6ff', borderLeft: '3px solid #2563eb', fontSize: '10px', fontWeight: 600, color: '#1e40af', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {ev.time.split(' ')[0]} {ev.subject}
                          </div>
                        ))}
                        {dayEvents.length > 2 && <div style={{ fontSize: '10px', color: '#94a3b8', paddingLeft: '4px' }}>+ {dayEvents.length - 2} buổi</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(calendarData?.events || []).length > 0 ? (
                    calendarData.events.map((ev: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', gap: '24px' }}>
                        <div style={{ width: '80px', paddingTop: '12px', fontSize: '14px', fontWeight: 700, color: '#2563eb', textAlign: 'right' }}>{ev.time.split(' - ')[0]}</div>
                        <div style={{ flex: 1 }}><EventCard event={ev} /></div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '64px', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>Không có lịch dạy trong ngày này.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function EventCard({ event }: { event: any }) {
  return (
    <div style={{ 
      padding: '12px 16px', 
      borderRadius: '12px', 
      background: '#eff6ff', 
      border: '1px solid #dbeafe', 
      borderLeft: '4px solid #3b82f6', 
      fontSize: '13px',
      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.05)',
      cursor: 'pointer'
    }}>
      <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>{event.time}</div>
      <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>{event.subject}</div>
      <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Icon icon="lucide:user" fontSize={12} /> {event.student}</div>
      <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Icon icon="lucide:map-pin" fontSize={12} /> {event.location}</div>
    </div>
  );
}
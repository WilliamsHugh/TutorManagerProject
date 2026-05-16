'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/tutor/Header';
import { Icon } from '@iconify/react';
import { getTutorSchedule } from '@/lib/api';

export default function CalendarPage() {
  const [calendar, setCalendar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!profile) setLoading(true);
        else setIsUpdating(true);

        // Truyền ngày hiện tại vào API để lấy đúng tuần
        const data = await getTutorSchedule(currentDate.toISOString().split('T')[0]);
        
        // Sửa từ data.schedule thành data.calendar cho khớp Backend
        setCalendar(data.calendar || []);
        setProfile(data.profile);
      } catch (error) {
        console.error("Lỗi tải lịch dạy:", error);
        setCalendar([]);
      } finally {
        setLoading(false);
        setIsUpdating(false);
      }
    };
    fetchData();
  }, [currentDate]); // Chạy lại khi đổi ngày

  const changeWeek = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + offset * 7);
    setCurrentDate(newDate);
  };

  const formatWeekRange = () => {
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(currentDate);
    monday.setDate(diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return `${monday.getDate()}/${monday.getMonth() + 1} - ${sunday.getDate()}/${sunday.getMonth() + 1}`;
  };

  return (
    <>
      <Header title="Lịch dạy" userProfile={profile} />
      <div className="content" style={{ padding: '32px' }}>
        <div className="calendar-wrapper" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="calendar-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Lịch biểu giảng dạy</h2>
              {isUpdating && <Icon icon="lucide:loader-2" className="animate-spin text-blue-600" fontSize={18} />}
            </div>

            <div className="calendar-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={() => setCurrentDate(new Date())}
                style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', cursor: 'pointer' }}
              >Hôm nay</button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => changeWeek(-1)} style={{ border: '1px solid #e2e8f0', background: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>
                  <Icon icon="lucide:chevron-left" />
                </button>
                <span style={{ fontSize: '15px', fontWeight: 600, minWidth: '100px', textAlign: 'center' }}>{formatWeekRange()}</span>
                <button onClick={() => changeWeek(1)} style={{ border: '1px solid #e2e8f0', background: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>
                  <Icon icon="lucide:chevron-right" />
                </button>
              </div>
            </div>
          </div>

          <div className="calendar-body" style={{ opacity: isUpdating ? 0.6 : 1, transition: 'opacity 0.2s' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 64 }}>
                <Icon icon="lucide:loader-2" className="animate-spin" fontSize={32} color="#64748b" />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e2e8f0' }}>
                {calendar.map((item, i) => (
                  <div key={i} style={{ borderRight: i < 6 ? '1px solid #e2e8f0' : 'none', minHeight: '500px', background: item.isToday ? '#f0f7ff' : '#fff' }}>
                    <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #f1f5f9', background: item.isToday ? '#eff6ff' : '#f8fafc' }}>
                      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{item.day}</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: item.isToday ? '#2563eb' : '#1e293b' }}>{item.date}</div>
                    </div>
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {item.events && item.events.map((ev: any, idx: number) => (
                        <div 
                          key={idx} 
                          style={{ 
                            padding: '10px', 
                            borderRadius: '8px', 
                            background: '#fff', 
                            border: '1px solid #e2e8f0', 
                            borderLeft: '4px solid #2563eb', 
                            fontSize: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: '4px' }}>{ev.time}</div>
                          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>{ev.subject}</div>
                          <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icon icon="lucide:user" fontSize={12} /> {ev.student}
                          </div>
                          <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icon icon="lucide:map-pin" fontSize={12} /> {ev.location}
                          </div>
                        </div>
                      ))}
                      {(!item.events || item.events.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: '#cbd5e1', fontSize: '11px' }}>Trống</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
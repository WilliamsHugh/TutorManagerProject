'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/tutor/Header';
import { Icon } from '@iconify/react';
import { getTutorSchedule } from '@/lib/api';

export default function CalendarPage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTutorSchedule()
      .then(data => setSchedule(data))
      .catch(() => setSchedule([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header title="Lịch dạy" />
      <div className="content" style={{ padding: '32px' }}>
        <div className="calendar-wrapper" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Header của Lịch (Hôm nay, Navigation, View Toggle) */}
          <div className="calendar-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          </div>

          {/* Grid Lịch */}
          <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f8fafc' }}>
             {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map(day => (
               <div key={day} style={{ padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#64748b' }}>{day}</div>
             ))}
          </div>

          <div className="calendar-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(130px, auto)' }}>
            {/* Render dữ liệu lịch dạy từ backend */}
            {loading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 32 }}>Đang tải lịch dạy...</div>
            ) : schedule.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 32 }}>Không có lịch dạy nào.</div>
            ) : (
              schedule.map((item, idx) => (
                <div key={idx} style={{ margin: 8, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                  <div><b>Môn:</b> {item.subject || '---'}</div>
                  <div><b>Thời gian:</b> {item.time || '---'}</div>
                  <div><b>Địa điểm:</b> {item.location || '---'}</div>
                  <div><b>Học sinh:</b> {item.studentName || '---'}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
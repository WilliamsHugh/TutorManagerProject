'use client';

import React, { useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import Calendar from '@/components/common/Calendar';
import type { CalendarEvent, ViewMode } from '@/components/common/Calendar';
import { getTutorSchedule } from '@/lib/api';
import Header from '@/components/tutor/Header';

export default function TutorCalendarPage() {
  const [profile, setProfile] = useState<any>(null);

  // ── Toast State ──
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch schedules with date/view params ──
  const fetchTutorSchedules = useCallback(
    async (date: Date, viewMode: ViewMode): Promise<CalendarEvent[]> => {
      const dateStr = date.toLocaleDateString('en-CA');
      const data = await getTutorSchedule(dateStr, viewMode);
      if (data?.profile) {
        setProfile(data.profile);
      }
      const rawEvents: any[] = [];
      if (data?.events && Array.isArray(data.events)) {
        rawEvents.push(...data.events);
      }
      if (data?.calendar && Array.isArray(data.calendar)) {
        for (const day of data.calendar) {
          if (day.events && Array.isArray(day.events)) {
            rawEvents.push(...day.events);
          }
        }
      }
      return rawEvents;
    },
    [],
  );

  return (
    <>
      <Calendar
        fetchSchedules={fetchTutorSchedules}
        title="Lịch giảng dạy"
        description="Quản lý lịch dạy và theo dõi các buổi học."
        emptyMessage="Bạn chưa có lịch dạy nào. Khi được phân công lớp, lịch dạy sẽ hiển thị tại đây."
        headerComponent={<Header title="Lịch giảng dạy" userProfile={profile} />}
      />

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border animate-in slide-in-from-bottom-4 max-w-[350px]"
          style={{
            background: toast.type === 'success' ? '#f0fdf4' : toast.type === 'error' ? '#fef2f2' : '#eff6ff',
            borderColor: toast.type === 'success' ? '#bbf7d0' : toast.type === 'error' ? '#fecaca' : '#bfdbfe',
            color: toast.type === 'success' ? '#166534' : toast.type === 'error' ? '#991b1b' : '#1e40af',
          }}>
          <Icon icon={toast.type === 'success' ? 'lucide:check-circle' : toast.type === 'error' ? 'lucide:alert-circle' : 'lucide:info'} fontSize={20} />
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="bg-transparent border-none cursor-pointer p-0 ml-auto opacity-60 hover:opacity-100">
            <Icon icon="lucide:x" fontSize={16} />
          </button>
        </div>
      )}
    </>
  );
}

'use client';

import React, { useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import Calendar from '@/components/common/Calendar';
import type { CalendarEvent, ViewMode } from '@/components/common/Calendar';
import { getTutorSchedule, createLeaveSchedule, cancelLeaveSchedule } from '@/lib/api';
import Header from '@/components/tutor/Header';

export default function TutorCalendarPage() {
  const [profile, setProfile] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Leave Modal State ──
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveStartTime, setLeaveStartTime] = useState('19:00');
  const [leaveEndTime, setLeaveEndTime] = useState('21:00');
  const [leaveNote, setLeaveNote] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);

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
      // The Calendar component normalizes events, but we also aggregate
      // from both data.events (month/day view) and data.calendar[*].events (week view)
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

  // ── Handle leave submission ──
  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate) {
      showToast('Vui lòng chọn ngày nghỉ.', 'error');
      return;
    }
    if (new Date(`${leaveEndDate}T${leaveEndTime}`) <= new Date(`${leaveStartDate}T${leaveStartTime}`)) {
      showToast('Thời gian kết thúc phải sau thời gian bắt đầu.', 'error');
      return;
    }
    if (!leaveNote.trim()) {
      showToast('Vui lòng nhập lý do nghỉ.', 'error');
      return;
    }
    try {
      setSubmittingLeave(true);
      const result = await createLeaveSchedule({
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        startTime: leaveStartTime,
        endTime: leaveEndTime,
        note: leaveNote.trim(),
      });
      showToast(result.message || 'Đăng ký nghỉ học thành công!', 'success');
      setIsLeaveModalOpen(false);
      setLeaveNote('');
      setRefreshKey((k) => k + 1);
    } catch (error: any) {
      showToast(error.message || 'Không thể đăng ký lịch nghỉ.', 'error');
    } finally {
      setSubmittingLeave(false);
    }
  };

  // ── Cancel leave ──
  const handleCancelLeave = async (eventId: string) => {
    try {
      await cancelLeaveSchedule(eventId);
      showToast('Đã hủy lịch nghỉ và khôi phục buổi học thành công.', 'success');
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      showToast(err.message || 'Không thể hủy lịch nghỉ', 'error');
    }
  };

  return (
    <>
      <Calendar
        key={refreshKey}
        fetchSchedules={fetchTutorSchedules}
        title="Lịch giảng dạy"
        description="Quản lý lịch dạy, đăng ký nghỉ dạy và theo dõi các buổi học."
        emptyMessage="Bạn chưa có lịch dạy nào. Khi được phân công lớp, lịch dạy sẽ hiển thị tại đây."
        headerComponent={<Header title="Lịch giảng dạy" userProfile={profile} />}
        extraToolbarActions={
          <button
            onClick={() => {
              const today = new Date().toLocaleDateString('en-CA');
              setLeaveStartDate(today);
              setLeaveEndDate(today);
              setLeaveStartTime('19:00');
              setLeaveEndTime('21:00');
              setLeaveNote('');
              setIsLeaveModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563eb] text-white border-none text-sm font-semibold cursor-pointer shadow-md hover:bg-[#1d4ed8] transition-colors"
          >
            <Icon icon="lucide:plus" fontSize={18} />
            Tạo lịch nghỉ
          </button>
        }
        onEventClick={(event) => {
          if (event.sessionStatus === 'cancelled' && window.confirm('Hủy lịch nghỉ và mở lại buổi học này?')) {
            handleCancelLeave(event.id);
          }
        }}
      />

      {/* ── Leave Modal ── */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setIsLeaveModalOpen(false)}>
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#dbeafe] flex items-center justify-center">
                  <Icon icon="lucide:calendar-off" fontSize={20} color="#2563eb" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">Đăng ký lịch nghỉ</h3>
                  <p className="text-xs text-slate-500 m-0">Chọn ngày và khung giờ nghỉ dạy</p>
                </div>
              </div>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer p-1">
                <Icon icon="lucide:x" fontSize={22} />
              </button>
            </div>
            <form onSubmit={handleSubmitLeave} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Thời gian bắt đầu</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-800 outline-none focus:border-blue-500 w-full"
                    value={leaveStartDate} onChange={(e) => { setLeaveStartDate(e.target.value); if (leaveEndDate && new Date(leaveEndDate) < new Date(e.target.value)) setLeaveEndDate(e.target.value); }} required />
                  <input type="time" className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-800 outline-none focus:border-blue-500 w-full"
                    value={leaveStartTime} onChange={(e) => setLeaveStartTime(e.target.value)} required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Thời gian kết thúc</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-800 outline-none focus:border-blue-500 w-full"
                    value={leaveEndDate} min={leaveStartDate} onChange={(e) => setLeaveEndDate(e.target.value)} required />
                  <input type="time" className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-800 outline-none focus:border-blue-500 w-full"
                    value={leaveEndTime} onChange={(e) => setLeaveEndTime(e.target.value)} required />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Lý do xin nghỉ</label>
                <textarea className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 outline-none focus:border-blue-500 w-full min-h-[70px] resize-y"
                  placeholder="Ví dụ: Gia sư có việc gia đình đột xuất..."
                  value={leaveNote} onChange={(e) => setLeaveNote(e.target.value)} required />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsLeaveModalOpen(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg font-medium transition-colors bg-white cursor-pointer text-sm">Hủy bỏ</button>
                <button type="submit" disabled={submittingLeave}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors cursor-pointer border-none text-sm disabled:opacity-50">
                  {submittingLeave ? 'Đang xử lý...' : 'Xác nhận nghỉ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

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

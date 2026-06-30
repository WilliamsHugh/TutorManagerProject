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

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveData, setLeaveData] = useState({
    startDate: '',
    endDate: '',
    startTime: '00:00',
    endTime: '23:59',
    note: ''
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelData, setCancelData] = useState({
    startDate: '',
    endDate: '',
  });
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveData.startDate || !leaveData.endDate || !leaveData.note) {
      showToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }
    try {
      setSubmittingLeave(true);
      const { createLeaveSchedule } = await import('@/lib/api');
      await createLeaveSchedule(leaveData);
      showToast("Đăng ký lịch nghỉ thành công!", "success");
      setIsLeaveModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Lỗi khi đăng ký lịch nghỉ", "error");
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleSubmitCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelData.startDate || !cancelData.endDate) {
      showToast("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc", "error");
      return;
    }
    try {
      setSubmittingCancel(true);
      const { cancelLeaveScheduleRange } = await import('@/lib/api');
      const res = await cancelLeaveScheduleRange(cancelData);
      showToast(res.message || "Hủy lịch nghỉ thành công!", "success");
      setIsCancelModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Lỗi khi hủy lịch nghỉ", "error");
    } finally {
      setSubmittingCancel(false);
    }
  };

  return (
    <>
      <Calendar
        fetchSchedules={fetchTutorSchedules}
        title="Lịch giảng dạy"
        description="Quản lý lịch dạy và theo dõi các buổi học."
        emptyMessage="Bạn chưa có lịch dạy nào. Khi được phân công lớp, lịch dạy sẽ hiển thị tại đây."
        headerComponent={<Header title="Lịch giảng dạy" userProfile={profile} />}
        extraToolbarActions={
          <div className="flex gap-2">
            <button 
              onClick={() => setIsCancelModalOpen(true)}
              className="px-4 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-2"
            >
              <Icon icon="lucide:calendar-check" /> Hủy lịch nghỉ
            </button>
            <button 
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors border-none cursor-pointer flex items-center gap-2"
            >
              <Icon icon="lucide:calendar-off" /> Đăng ký nghỉ
            </button>
          </div>
        }
      />

      {/* ── Modal Thêm Lịch Nghỉ ── */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Đăng ký lịch nghỉ</h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer">
                <Icon icon="lucide:x" fontSize={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitLeave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Từ ngày</label>
                  <input type="date" className="w-full p-2.5 border rounded-lg text-sm" required value={leaveData.startDate} onChange={e => setLeaveData({...leaveData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Đến ngày</label>
                  <input type="date" className="w-full p-2.5 border rounded-lg text-sm" required value={leaveData.endDate} onChange={e => setLeaveData({...leaveData, endDate: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Từ giờ</label>
                  <input type="time" className="w-full p-2.5 border rounded-lg text-sm" required value={leaveData.startTime} onChange={e => setLeaveData({...leaveData, startTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Đến giờ</label>
                  <input type="time" className="w-full p-2.5 border rounded-lg text-sm" required value={leaveData.endTime} onChange={e => setLeaveData({...leaveData, endTime: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Lý do nghỉ</label>
                <textarea className="w-full p-2.5 border rounded-lg text-sm min-h-[80px]" required placeholder="Nhập lý do nghỉ..." value={leaveData.note} onChange={e => setLeaveData({...leaveData, note: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="px-5 py-2.5 rounded-lg border bg-white text-slate-700 font-semibold cursor-pointer">Hủy</button>
                <button type="submit" disabled={submittingLeave} className="px-5 py-2.5 rounded-lg border-none bg-blue-600 text-white font-semibold cursor-pointer disabled:opacity-50">
                  {submittingLeave ? 'Đang lưu...' : 'Xác nhận nghỉ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Hủy Lịch Nghỉ ── */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Hủy đăng ký lịch nghỉ</h3>
              <button onClick={() => setIsCancelModalOpen(false)} className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer">
                <Icon icon="lucide:x" fontSize={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitCancel} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Từ ngày</label>
                  <input type="date" className="w-full p-2.5 border rounded-lg text-sm" required value={cancelData.startDate} onChange={e => setCancelData({...cancelData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Đến ngày</label>
                  <input type="date" className="w-full p-2.5 border rounded-lg text-sm" required value={cancelData.endDate} onChange={e => setCancelData({...cancelData, endDate: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsCancelModalOpen(false)} className="px-5 py-2.5 rounded-lg border bg-white text-slate-700 font-semibold cursor-pointer">Quay lại</button>
                <button type="submit" disabled={submittingCancel} className="px-5 py-2.5 rounded-lg border-none bg-rose-600 text-white font-semibold cursor-pointer disabled:opacity-50">
                  {submittingCancel ? 'Đang thực hiện...' : 'Khôi phục lịch dạy'}
                </button>
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

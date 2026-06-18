'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { getTutorSchedule, createLeaveSchedule, cancelLeaveSchedule } from '@/lib/api';
import Header from '@/components/tutor/Header';

export default function CalendarPage() {
  const [calendarData, setCalendarData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // State cho Modal tạo lịch nghỉ
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveStartTime, setLeaveStartTime] = useState('19:00');
  const [leaveEndTime, setLeaveEndTime] = useState('21:00');
  const [leaveNote, setLeaveNote] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // State cho custom toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // State cho custom confirm modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchData = async () => {
    try {
      if (!profile) setLoading(true);
      else setIsUpdating(true);

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

  useEffect(() => {
    fetchData();
  }, [currentDate, viewMode]);

  const handleOpenLeaveModal = () => {
    const today = currentDate.toLocaleDateString('en-CA');
    setLeaveStartDate(today);
    setLeaveEndDate(today);
    setLeaveStartTime('19:00');
    setLeaveEndTime('21:00');
    setLeaveNote('');
    setIsLeaveModalOpen(true);
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate) {
      showToast("Vui lòng chọn ngày nghỉ.", "error");
      return;
    }
    const startDT = new Date(`${leaveStartDate}T${leaveStartTime}`);
    const endDT = new Date(`${leaveEndDate}T${leaveEndTime}`);
    if (endDT <= startDT) {
      showToast("Thời gian kết thúc phải sau thời gian bắt đầu.", "error");
      return;
    }
    if (!leaveNote.trim()) {
      showToast("Vui lòng nhập lý do nghỉ.", "error");
      return;
    }

    try {
      setSubmittingLeave(true);
      const result = await createLeaveSchedule({
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        startTime: leaveStartTime,
        endTime: leaveEndTime,
        note: leaveNote.trim()
      });

      showToast(result.message || 'Đăng ký nghỉ học thành công!', "success");
      setIsLeaveModalOpen(false);
      setLeaveNote('');
      
      await fetchData();
    } catch (error: any) {
      console.error("Lỗi đăng ký nghỉ học:", error);
      showToast(error.message || "Không thể đăng ký lịch nghỉ. Vui lòng thử lại.", "error");
    } finally {
      setSubmittingLeave(false);
    }
  };

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
      <Header title="Lịch giảng dạy" userProfile={profile} />

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
              <button 
                onClick={handleOpenLeaveModal}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', 
                  background: '#2563eb', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                }}
              >
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
                      {(item.events || []).map((ev: any, idx: number) => <EventCard key={idx} event={ev} onRefresh={fetchData} onShowToast={showToast} onShowConfirm={(msg, cb) => setConfirmModal({ isOpen: true, message: msg, onConfirm: cb })} />)}
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
                        {dayEvents.slice(0, 2).map((ev: any, idx: number) => {
                          const isCancelled = ev.status === 'cancelled';
                          return (
                            <div 
                              key={idx} 
                              style={{ 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                background: isCancelled ? '#fee2e2' : '#eff6ff', 
                                borderLeft: isCancelled ? '3px solid #ef4444' : '3px solid #2563eb', 
                                fontSize: '10px', 
                                fontWeight: 600, 
                                color: isCancelled ? '#b91c1c' : '#1e40af', 
                                overflow: 'hidden', 
                                whiteSpace: 'nowrap', 
                                textOverflow: 'ellipsis',
                                textDecoration: isCancelled ? 'line-through' : 'none'
                              }}
                              title={isCancelled ? `[Lịch nghỉ] ${ev.subject}` : ev.subject}
                            >
                              {ev.time.split(' ')[0]} {ev.subject}
                            </div>
                          );
                        })}
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
                        <div style={{ flex: 1 }}><EventCard event={ev} onRefresh={fetchData} onShowToast={showToast} onShowConfirm={(msg, cb) => setConfirmModal({ isOpen: true, message: msg, onConfirm: cb })} /></div>
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

      {/* Modal Tạo lịch nghỉ */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setIsLeaveModalOpen(false)}>
          <div 
            className="bg-white rounded-xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-slate-50">
              <div className="flex items-center gap-3">
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon icon="lucide:calendar-off" fontSize={20} color="#2563eb" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900" style={{ margin: 0 }}>Đăng ký lịch nghỉ</h3>
                  <p className="text-xs text-slate-500" style={{ margin: 0 }}>Chọn ngày và khung giờ nghỉ dạy</p>
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
                  <input 
                    type="date"
                    className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-800 outline-none focus:border-blue-500 w-full"
                    value={leaveStartDate}
                    onChange={(e) => {
                      setLeaveStartDate(e.target.value);
                      if (leaveEndDate && new Date(leaveEndDate) < new Date(e.target.value)) {
                        setLeaveEndDate(e.target.value);
                      }
                    }}
                    required
                  />
                  <input 
                    type="time"
                    className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-800 outline-none focus:border-blue-500 w-full"
                    value={leaveStartTime}
                    onChange={(e) => setLeaveStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Thời gian kết thúc</label>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="date"
                    className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-800 outline-none focus:border-blue-500 w-full"
                    value={leaveEndDate}
                    min={leaveStartDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    required
                  />
                  <input 
                    type="time"
                    className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-800 outline-none focus:border-blue-500 w-full"
                    value={leaveEndTime}
                    onChange={(e) => setLeaveEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Lý do xin nghỉ</label>
                <textarea 
                  className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-800 outline-none focus:border-blue-500 w-full"
                  style={{ minHeight: 70, resize: 'vertical' }}
                  placeholder="Ví dụ: Gia sư có việc gia đình đột xuất, sẽ bù vào buổi sau..."
                  value={leaveNote}
                  onChange={(e) => setLeaveNote(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg font-medium transition-colors bg-white cursor-pointer text-sm"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  disabled={submittingLeave} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors cursor-pointer border-none text-sm disabled:opacity-50"
                >
                  {submittingLeave ? 'Đang xử lý...' : 'Xác nhận nghỉ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: toast.type === 'success' ? '1px solid #bbf7d0' : toast.type === 'error' ? '1px solid #fecaca' : '1px solid #bfdbfe',
            background: toast.type === 'success' ? '#f0fdf4' : toast.type === 'error' ? '#fef2f2' : '#eff6ff',
            color: toast.type === 'success' ? '#166534' : toast.type === 'error' ? '#991b1b' : '#1e40af',
            animation: 'slideIn 0.3s ease-out forwards',
            maxWidth: '350px',
          }}
        >
          <Icon 
            icon={toast.type === 'success' ? 'lucide:check-circle' : toast.type === 'error' ? 'lucide:alert-circle' : 'lucide:info'} 
            fontSize={20} 
            color={toast.type === 'success' ? '#15803d' : toast.type === 'error' ? '#dc2626' : '#2563eb'}
          />
          <div style={{ fontSize: '13.5px', fontWeight: 550, lineHeight: 1.4 }}>{toast.message}</div>
          <button 
            onClick={() => setToast(null)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer', 
              padding: 0, 
              marginLeft: 'auto',
              color: toast.type === 'success' ? '#166534' : toast.type === 'error' ? '#991b1b' : '#1e40af',
              opacity: 0.6,
            }}
          >
            <Icon icon="lucide:x" fontSize={16} />
          </button>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4"
          onClick={() => setConfirmModal(null)}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 flex flex-col items-center text-center gap-3">
              <div style={{ width: 48, height: 48, borderRadius: 24, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon="lucide:alert-triangle" fontSize={24} color="#ef4444" style={{ margin: 'auto' }} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900" style={{ margin: 0 }}>Xác nhận</h3>
                <p className="text-sm text-slate-500 mt-1" style={{ margin: 0 }}>{confirmModal.message}</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmModal(null)}
                className="border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors bg-white cursor-pointer text-xs"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer border-none text-xs"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(100px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

function EventCard({ event, onRefresh, onShowToast, onShowConfirm }: { 
  event: any; 
  onRefresh: () => void; 
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onShowConfirm: (msg: string, onConfirm: () => void) => void;
}) {
  const isCancelled = event.status === 'cancelled';

  return (
    <div style={{ 
      padding: '12px 16px', 
      borderRadius: '12px', 
      background: isCancelled ? '#fef2f2' : '#eff6ff', 
      border: isCancelled ? '1px solid #fca5a5' : '1px solid #dbeafe', 
      borderLeft: isCancelled ? '4px solid #ef4444' : '4px solid #3b82f6', 
      fontSize: '13px',
      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.05)',
      cursor: 'pointer',
      opacity: isCancelled ? 0.85 : 1
    }}>
      <div style={{ fontWeight: 700, color: isCancelled ? '#b91c1c' : '#1e40af', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{event.time}</span>
        {isCancelled && <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 800 }}>LỊCH NGHỈ</span>}
      </div>
      <div style={{ fontWeight: 600, color: isCancelled ? '#7f1d1d' : '#1e293b', marginBottom: '2px', textDecoration: isCancelled ? 'line-through' : 'none' }}>{event.subject}</div>
      <div style={{ color: isCancelled ? '#991b1b' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Icon icon="lucide:user" fontSize={12} /> {event.student}</div>
      {event.note && isCancelled ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
          <div style={{ color: '#ef4444', fontSize: '11px', fontWeight: 550, background: '#fff', padding: '6px 10px', borderRadius: '6px', border: '1px dashed #fca5a5' }}>
            Lý do: {event.note}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowConfirm(
                "Bạn có chắc chắn muốn hủy lịch nghỉ và mở lại buổi học này không?",
                async () => {
                  try {
                    await cancelLeaveSchedule(event.id);
                    onShowToast("Đã hủy lịch nghỉ và khôi phục buổi học thành công.", "success");
                    onRefresh();
                  } catch (err: any) {
                    onShowToast(err.message || "Không thể hủy lịch nghỉ", "error");
                  }
                }
              );
            }}
            style={{
              alignSelf: 'flex-start',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#dc2626')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#ef4444')}
          >
            <Icon icon="lucide:rotate-ccw" fontSize={11} /> Hủy lịch nghỉ
          </button>
        </div>
      ) : (
        <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Icon icon="lucide:map-pin" fontSize={12} /> {event.location}</div>
      )}
    </div>
  );
}
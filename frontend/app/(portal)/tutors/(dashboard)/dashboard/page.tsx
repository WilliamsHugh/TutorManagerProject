'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { 
  getTutorDashboard, 
  getNewClasses,
  getClassRequestDetail, 
  getLearningReports, 
  submitLearningReport, 
  updateLearningReport, 
  deleteLearningReport 
} from '@/lib/api'; 
import { getAuthUser } from '@/lib/auth';
import Link from 'next/link';
import Header from '@/components/tutor/Header';

export default function TutorDashboard() {
  // 1. Khởi tạo State rỗng để đợi dữ liệu từ backend
  const [stats, setStats] = useState<any[]>([]);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [suggestedClasses, setSuggestedClasses] = useState<any[]>([]);
  const [currentClasses, setCurrentClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

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

  // State cho Modals
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedSuggestedClass, setSelectedSuggestedClass] = useState<any>(null);
  
  // Quản lý Report
  const [reportingClass, setReportingClass] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [isEditingReport, setIsEditingReport] = useState<string | null>(null);
  const [reportFormData, setReportFormData] = useState({ 
    content: '', 
    homework: '', 
    progressRating: 'good',
    attendanceStatus: true 
  });

  // 2. Tự động lấy dữ liệu từ Backend khi load trang
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Chỉ hiện loading toàn trang nếu chưa có dữ liệu profile (lần đầu mount)
        if (!profile) {
          setLoading(true);
        } else {
          setIsUpdating(true);
        }

        // Gọi API thực tế
        const data = await getTutorDashboard(currentDate.toISOString().split('T')[0]);
        
        setStats(data.stats || []);
        setCalendar(data.calendar || []);
        setCurrentClasses(data.currentClasses || []);
        setProfile(data.profile);

        // Suggested classes được fetch riêng ở useEffect dưới — không ghi đè ở đây
      } catch (error) {
        console.error("Lỗi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
        setIsUpdating(false);
      }
    };

    fetchDashboardData();
  }, [currentDate]);

  // Fetch suggested classes từ cùng API với trang /tutors/new-classes
  useEffect(() => {
    const fetchSuggestedClasses = async () => {
      try {
        const newClassesData = await getNewClasses();
        const mapped = (newClassesData.classes || []).map((cls: any) => ({
          id: cls.id,
          subject: cls.title?.replace('Tìm gia sư ', '') || 'Môn học mới',
          location: cls.location || 'Toàn quốc',
          schedule: cls.schedule || 'Linh hoạt',
          price: cls.salary || 'Thỏa thuận',
          isNew: true
        }));
        setSuggestedClasses(mapped);
      } catch (error) {
        console.error("Lỗi tải lớp học mới gợi ý:", error);
        // Giữ nguyên dữ liệu fallback từ dashboard nếu fetch thất bại
      }
    };
    fetchSuggestedClasses();
  }, []);

  // Tải danh sách báo cáo khi chọn lớp
  useEffect(() => {
    if (reportingClass?.classId) {
      getLearningReports(reportingClass.classId).then(setReports);
    }
  }, [reportingClass]);

  const handleSaveReport = async () => {
    if (!reportingClass?.classId) {
      showToast("Không tìm thấy mã định danh lớp học (UUID). Vui lòng thử tải lại trang.", "error");
      return;
    }

    try {
      if (isEditingReport) {
        await updateLearningReport(isEditingReport, reportFormData);
      } else {
        if (!reportingClass.classId || typeof reportingClass.classId !== 'string') {
          throw new Error("Mã định danh lớp học không hợp lệ.");
        }

        await submitLearningReport({
          classId: reportingClass.classId.trim(),
          ...reportFormData
        });
      }

      showToast(isEditingReport ? "Cập nhật báo cáo thành công!" : "Gửi báo cáo thành công!", "success");
      
      // Tải lại danh sách báo cáo và đóng Modal
      const updated = await getLearningReports(reportingClass.classId);
      setReports(updated);
      setReportingClass(null); // Đóng modal sau khi thành công
      setIsEditingReport(null);
      setReportFormData({ content: '', homework: '', progressRating: 'good', attendanceStatus: true });
    } catch (err: any) { 
      console.error("Report Save Error:", err);
      showToast(err.message || "Lỗi khi lưu báo cáo. Vui lòng kiểm tra lại dữ liệu.", "error"); 
    }
  };

  const handleDeleteReport = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: "Xác nhận xóa báo cáo này?",
      onConfirm: async () => {
        try {
          await deleteLearningReport(id);
          showToast("Xóa báo cáo thành công!", "success");
          setReports(reports.filter(r => r.id !== id));
        } catch (err: any) {
          showToast(err.message || "Không thể xóa báo cáo", "error");
        }
      }
    });
  };

  const handleShowClassDetail = async (id: string) => {
    try {
      const detail = await getClassRequestDetail(id);
      setSelectedSuggestedClass(detail);
    } catch (error) {
      showToast("Không thể lấy chi tiết lớp học này.", "error");
    }
  };

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
      <Header title="Dashboard" userProfile={profile} />
      
      <div className="content" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* User Info Welcome Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', 
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold'
          }}>
            {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'G'}
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Chào mừng trở lại, {profile?.fullName || 'Gia sư'}!</h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
            <Icon icon="lucide:loader-2" className="animate-spin inline-block mr-2" /> Đang tải dữ liệu...
          </div>
        ) : (
          <>
            {/* Stats Row */}
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {stats.length > 0 ? stats.map((stat, i) => (
                <div key={i} className="stat-card" style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className={`stat-icon ${stat.color}`} style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                    <Icon icon={stat.icon} />
                  </div>
                  <div className="stat-data" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="stat-label" style={{ fontSize: '13px', color: '#64748b' }}>{stat.label}</span>
                    <span className="stat-value" style={{ fontSize: '24px', fontWeight: 700 }}>
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

            {/* Main Grid: Calendar & Suggestions */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              
              {/* Weekly Calendar */}
              <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 className="card-title" style={{ fontSize: '16px', fontWeight: 600 }}>Lịch dạy tuần này</h2>
                    {isUpdating && <Icon icon="lucide:loader-2" className="animate-spin text-blue-600" fontSize={16} />}
                  </div>
                  
                  <div className="card-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                      onClick={() => changeWeek(-1)}
                      style={{ border: '1px solid #e2e8f0', background: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                    ><Icon icon="lucide:chevron-left" /></button>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{formatWeekRange()}</span>
                    <button 
                      onClick={() => changeWeek(1)}
                      style={{ border: '1px solid #e2e8f0', background: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                    ><Icon icon="lucide:chevron-right" /></button>
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
                            <div style={{ fontSize: '18px', fontWeight: 600 }}>{item.date}</div>
                          </div>
                          {item.event && (
                            <div 
                              className={`event ${item.event.color}`} 
                              style={{ padding: '8px', borderRadius: '4px', fontSize: '11px', background: '#dbeafe', borderLeft: '3px solid #3b82f6', cursor: 'pointer' }}
                              onClick={() => setSelectedEvent(item.event)}
                            >
                              <div style={{ fontWeight: 700 }}>{item.event.time}</div>
                              <div style={{ fontWeight: 600 }}>{item.event.title}</div>
                              <div style={{ marginTop: '4px' }}>{item.event.student}</div>
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

              {/* Suggested Classes */}
              <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                  <h2 className="card-title" style={{ fontSize: '16px', fontWeight: 600 }}>Lớp học mới gợi ý</h2>
                  <Link href="/tutors/new-classes" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>Xem tất cả</Link>
                </div>
                <div className="suggested-list" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '390px', overflowY: 'auto' }}>
                  {suggestedClasses.length > 0 ? suggestedClasses.map((cls, i) => (
                    <div key={i} className="s-item" style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600 }}>{cls.subject}</span>
                        {cls.isNew && <span style={{ background: '#fef08a', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>MỚI</span>}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon icon="lucide:map-pin" /> {cls.location}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon icon="lucide:calendar-clock" /> {cls.schedule}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon icon="lucide:banknote" /> {cls.price}</div>
                      </div>
                      <button 
                        onClick={() => handleShowClassDetail(cls.id)}
                        style={{ width: '100%', marginTop: '12px', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'none', cursor: 'pointer' }}
                      >Xem chi tiết</button>
                    </div>
                  )) : (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>Chưa có lớp học gợi ý lúc này.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Current Classes Table */}
            <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <h2 className="card-title" style={{ fontSize: '16px', fontWeight: 600 }}>Danh sách lớp đang phụ trách</h2>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>
                    <th style={{ padding: '16px 24px' }}>Mã lớp</th>
                    <th style={{ padding: '16px 24px' }}>Môn học</th>
                    <th style={{ padding: '16px 24px' }}>Học viên</th>
                    <th style={{ padding: '16px 24px' }}>Tiến độ</th>
                    <th style={{ padding: '16px 24px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentClasses.length > 0 ? currentClasses.map((cls, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '16px 24px', fontWeight: 500 }}>{cls.id}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 500 }}>{cls.subject}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{cls.type}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>{cls.student}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ width: '120px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                          <div style={{ height: '100%', background: '#2563eb', width: `${cls.progress}%` }}></div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{cls.sessions}</span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <button 
                          onClick={() => setReportingClass({ id: cls.id, classId: cls.rawId, name: cls.subject, student: cls.student })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px' }} 
                          title="Báo cáo"
                        ><Icon icon="lucide:file-text" fontSize={18} /></button>
                        <button 
                          onClick={() => showToast("Tính năng nhắn tin đang được phát triển (Database chưa có bảng Messages)", "info")}
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }} 
                          title="Nhắn tin"
                        ><Icon icon="lucide:message-square" fontSize={18} /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Bạn chưa phụ trách lớp nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Modal Quản lý Báo cáo học tập (CRUD) */}
        {reportingClass && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Quản lý báo cáo: {reportingClass.name}</h3>
                  <p className="text-xs text-blue-800 mt-1 font-semibold">Học viên: {reportingClass.student}</p>
                </div>
                <button onClick={() => { setReportingClass(null); setIsEditingReport(null); }} className="text-slate-400 hover:text-slate-600">
                  <Icon icon="lucide:x" fontSize={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Form Nhập liệu */}
                <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Icon icon={isEditingReport ? "lucide:edit-3" : "lucide:plus-circle"} />
                    {isEditingReport ? 'Cập nhật báo cáo' : 'Viết báo cáo buổi học mới'}
                  </h4>
                  <textarea 
                    className="w-full p-3 border border-slate-200 rounded-lg mb-3 min-h-[100px] text-sm outline-none focus:border-blue-500 transition-all" 
                    placeholder="Nội dung kiến thức đã dạy..."
                    value={reportFormData.content}
                    onChange={(e) => setReportFormData({...reportFormData, content: e.target.value})}
                  />
                  <input 
                    className="w-full p-3 border border-slate-200 rounded-lg mb-3 text-sm outline-none focus:border-blue-500" 
                    placeholder="Bài tập về nhà..."
                    value={reportFormData.homework}
                    onChange={(e) => setReportFormData({...reportFormData, homework: e.target.value})}
                  />
                  <div className="flex justify-between items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={reportFormData.attendanceStatus}
                        onChange={(e) => setReportFormData({...reportFormData, attendanceStatus: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-slate-700">Học viên có đi học</span>
                    </label>
                    <select 
                       className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white"
                       value={reportFormData.progressRating}
                       onChange={(e) => setReportFormData({...reportFormData, progressRating: e.target.value})}
                    >
                      <option value="good">Đánh giá: Tốt</option>
                      <option value="fair">Đánh giá: Khá</option>
                      <option value="excellent">Đánh giá: Xuất sắc</option>
                      <option value="poor">Đánh giá: Cần cố gắng</option>
                    </select>
                    <button onClick={handleSaveReport} className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">Lưu</button>
                  </div>
                </div>

                {/* Danh sách lịch sử */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-700 flex items-center gap-2"><Icon icon="lucide:history" /> Lịch sử báo cáo</h4>
                  {reports.map((r: any) => (
                    <div key={r.id || Math.random()} className="border border-slate-100 p-4 rounded-lg bg-white shadow-sm">
                      <div className="flex justify-between items-start mb-2 text-xs text-slate-400">
                        <span>{new Date(r.reportDate).toLocaleDateString('vi-VN')}</span>
                        <div className="flex gap-3">
                          <button onClick={() => { setIsEditingReport(r.id); setReportFormData({ content: r.content, homework: r.homework, progressRating: r.progressRating, attendanceStatus: r.attendanceStatus ?? true }); }} className="text-blue-600 font-semibold">Sửa</button>
                          <button onClick={() => handleDeleteReport(r.id)} className="text-red-500 font-semibold">Xóa</button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 font-medium">{r.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
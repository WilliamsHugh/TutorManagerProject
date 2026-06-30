'use client';

import { useState, useEffect } from 'react';
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
import Header from '@/components/tutor/Header';
import { Skeleton } from '@/components/common/Skeleton';

// Subcomponents
import { TutorStatsRow } from './_components/TutorStatsRow';
import { WeeklyCalendar } from './_components/WeeklyCalendar';
import { SuggestedClasses } from './_components/SuggestedClasses';
import { AssignedClassesTable } from './_components/AssignedClassesTable';
import { LearningReportModal } from './_components/LearningReportModal';
import { ConfirmModal } from './_components/ConfirmModal';

export function TutorDashboardClient() {
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
      await getClassRequestDetail(id);
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
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }} className="text-slate-800">Chào mừng trở lại, {profile?.fullName || 'Gia sư'}!</h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        
        {loading ? (
          <TutorDashboardSkeleton />
        ) : (
          <>
            {/* Stats Row */}
            <TutorStatsRow stats={stats} />

            {/* Main Grid: Calendar & Suggestions */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              
              {/* Weekly Calendar */}
              <WeeklyCalendar
                calendar={calendar}
                isUpdating={isUpdating}
                onPrevWeek={() => changeWeek(-1)}
                onNextWeek={() => changeWeek(1)}
                weekRangeLabel={formatWeekRange()}
              />

              {/* Suggested Classes */}
              <SuggestedClasses
                suggestedClasses={suggestedClasses}
                onShowDetail={handleShowClassDetail}
              />
            </div>

            {/* Current Classes Table */}
            <AssignedClassesTable
              currentClasses={currentClasses}
              onReportClick={(cls) => {
                if (cls.submittedReportsCount >= cls.completedSessions) {
                  showToast("Bạn đã nộp đủ báo cáo cho các buổi học tính đến hiện tại. Không thể nộp báo cáo cho các buổi học trong tương lai.", "error");
                } else {
                  setReportingClass(cls);
                }
              }}
              onMessageClick={() => showToast("Tính năng nhắn tin đang được phát triển (Database chưa có bảng Messages)", "info")}
            />
          </>
        )}

        {/* Modal Quản lý Báo cáo học tập (CRUD) */}
        <LearningReportModal
          reportingClass={reportingClass}
          reports={reports}
          isEditingReport={isEditingReport}
          reportFormData={reportFormData}
          setReportFormData={setReportFormData}
          setIsEditingReport={setIsEditingReport}
          onClose={() => { setReportingClass(null); setIsEditingReport(null); }}
          onSave={handleSaveReport}
          onDelete={handleDeleteReport}
        />
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
      <ConfirmModal
        isOpen={confirmModal !== null && confirmModal.isOpen}
        message={confirmModal ? confirmModal.message : ''}
        onConfirm={confirmModal ? confirmModal.onConfirm : () => {}}
        onClose={() => setConfirmModal(null)}
      />

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

function TutorDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-6">
            <Skeleton className="size-14 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-7 w-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <Skeleton className="h-5 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-24 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-3 p-6">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-md" />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <Skeleton className="mb-5 h-5 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-lg border border-slate-100 p-3">
                <Skeleton className="mb-2 h-4 w-2/3" />
                <Skeleton className="mb-3 h-3.5 w-1/2" />
                <Skeleton className="h-8 w-full rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <Skeleton className="mb-5 h-5 w-40" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-slate-100 p-4">
              <Skeleton className="mb-3 h-4 w-1/2" />
              <Skeleton className="mb-2 h-3.5 w-2/3" />
              <Skeleton className="h-8 w-28 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

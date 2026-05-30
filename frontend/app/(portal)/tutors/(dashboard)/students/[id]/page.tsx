'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/tutor/Header';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import {
  ChevronRight,
  Hash,
  GraduationCap,
  CalendarDays,
  MessageSquare,
  ClipboardEdit,
  TrendingUp,
  ClipboardList,
  Target,
  BarChart2,
  Contact,
  Check,
  Star,
  BookOpen,
} from 'lucide-react';
import { 
  getTutorStudents, 
  getTutorDashboard, 
  getLearningReports, 
  submitLearningReport 
} from '@/lib/api';
import { useParams } from 'next/navigation';

export default function StudentDetailPage() {
  const [student, setStudent] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [classDetail, setClassDetail] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [reportHomework, setReportHomework] = useState('');
  const [progressRating, setProgressRating] = useState('good'); // 'excellent', 'good', 'fair', 'poor'
  const [attendanceStatus, setAttendanceStatus] = useState(true); // true = Present, false = Absent

  const params = useParams();
  const studentId = params.id;

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      // 1. Fetch student base data
      const data = await getTutorStudents();
      const foundStudent = data.students.find((s: any) => s.id === studentId);
      
      if (foundStudent) {
        setStudent(foundStudent);
      } else {
        alert("Không tìm thấy học viên này.");
      }
      setProfile(data.profile);

      // 2. Fetch tutor dashboard classes to find class details
      const dashboardData = await getTutorDashboard();
      if (dashboardData.currentClasses) {
        const foundClass = dashboardData.currentClasses.find((cls: any) => cls.studentId === studentId);
        if (foundClass) {
          setClassDetail(foundClass);
          
          // 3. Fetch actual learning reports for this class from database
          setLoadingReports(true);
          const reportsData = await getLearningReports(foundClass.rawId);
          if (Array.isArray(reportsData)) {
            setReports(reportsData);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi tải chi tiết học viên từ database:", error);
    } finally {
      setLoading(false);
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentDetail();
    }
  }, [studentId]);

  // Compute dynamic stats based on actual database reports
  const computedStats = useMemo(() => {
    const totalReports = reports.length;
    const completedCount = classDetail?.completedSessions || totalReports;
    const totalSessions = classDetail?.totalSessions || 20;
    const progressPercent = classDetail?.progress || 0;

    // 1. Đã học (buổi): số buổi có mặt hoặc số báo cáo
    const attended = reports.filter(r => r.attendanceStatus === true).length;
    const displayAttended = totalReports > 0 ? attended : completedCount;

    // 2. Vắng mặt: số báo cáo vắng mặt
    const absent = reports.filter(r => r.attendanceStatus === false).length;

    // 3. Làm BTVN: tỷ lệ báo cáo có ghi bài tập và hoàn thành
    const homeworkRate = totalReports > 0 
      ? Math.round((reports.filter(r => r.homework && r.homework.trim() !== '').length / totalReports) * 100)
      : 0;

    // 4. Điểm trung bình (GPA): excellent = 5, good = 4, fair = 3, poor = 2
    let gpa = '5.0';
    if (totalReports > 0) {
      const sum = reports.reduce((acc, r) => {
        const rating = String(r.progressRating).toLowerCase();
        if (rating === 'excellent') return acc + 5;
        if (rating === 'good') return acc + 4;
        if (rating === 'fair') return acc + 3;
        return acc + 2;
      }, 0);
      gpa = (sum / totalReports).toFixed(1);
    }

    return {
      attended: displayAttended,
      totalSessions,
      progressPercent,
      absent,
      homeworkRate,
      gpa
    };
  }, [reports, classDetail]);

  // Handle report submission to database
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classDetail?.rawId) {
      alert("Không tìm thấy thông tin lớp học để nộp báo cáo.");
      return;
    }
    if (!reportContent.trim()) {
      alert("Vui lòng nhập nội dung buổi học.");
      return;
    }

    try {
      setSubmitting(true);
      await submitLearningReport({
        classId: classDetail.rawId,
        content: reportContent.trim(),
        homework: reportHomework.trim(),
        progressRating: progressRating,
        attendanceStatus: attendanceStatus
      });

      // Reset form and close modal
      setReportContent('');
      setReportHomework('');
      setProgressRating('good');
      setAttendanceStatus(true);
      setIsModalOpen(false);

      // Refresh database records
      await fetchStudentDetail();
      alert("Nộp báo cáo học tập thành công!");
    } catch (error: any) {
      console.error("Lỗi nộp báo cáo lên database:", error);
      alert(error.message || "Không thể nộp báo cáo. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Chi tiết học viên" userProfile={profile} />
        <div className="flex-grow flex flex-col items-center justify-center py-24 gap-3">
          <Icon icon="lucide:loader-2" className="animate-spin text-indigo-600" fontSize={40} />
          <p className="text-slate-500 font-medium text-sm">Đang tải thông tin từ database...</p>
        </div>
      </>
    );
  }

  if (!student) {
    return (
      <>
        <Header title="Chi tiết học viên" userProfile={profile} />
        <div className="flex-grow flex flex-col items-center justify-center py-24 px-4 text-center max-w-md mx-auto gap-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
            <Icon icon="lucide:alert-circle" fontSize={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Không tìm thấy học viên</h3>
            <p className="text-slate-500 text-sm mt-1">Thông tin học viên này không tồn tại trong hệ thống quản lý của bạn hoặc bạn không có quyền truy cập.</p>
          </div>
          <Link href="/tutors/students" className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all no-underline">
            Quay lại danh sách
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Chi tiết học viên" userProfile={profile} />
      
      <div className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-6 animate-in fade-in duration-300">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm self-start">
          <Link href="/tutors/students" className="text-slate-500 hover:text-indigo-600 no-underline font-medium transition-colors">Học viên của tôi</Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="font-bold text-slate-800">{student.fullName}</span>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-slate-150 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={student.avatar || "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F1"}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-50"
                alt={student.fullName}
              />
              <span className={`absolute bottom-1 right-1 block h-3.5 w-3.5 rounded-full ring-2 ring-white ${
                student.status === 'Đang học' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{student.fullName}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-indigo-600"><Hash size={14} /> ID: {student.id?.substring(0, 8).toUpperCase()}</span>
                <span className="flex items-center gap-1.5 text-emerald-600"><GraduationCap size={14} /> Cấp học: {student.gradeLevel}</span>
                <span className="flex items-center gap-1.5 text-amber-600"><CalendarDays size={14} /> Tham gia: {new Date(student.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => alert("Tính năng nhắn tin đang phát triển")} 
              className="px-4.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare size={16} /> Nhắn tin
            </button>
            {classDetail && (
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="px-4.5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer border-none"
              >
                <ClipboardEdit size={16} /> Nộp báo cáo học tập
              </button>
            )}
          </div>
        </div>

        {/* Main Details Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Progress & Timeline (Col span 2) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Panel 1: Progress */}
            <SectionPanel title="Hồ sơ năng lực & Tiến độ" icon={<TrendingUp size={20} className="text-indigo-600" />}>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm font-bold text-slate-700">
                    <span>Khóa học: {classDetail?.subject || student.lastSubject || 'Chưa rõ'} ({computedStats.attended}/{computedStats.totalSessions} buổi)</span>
                    <span className="text-indigo-600">{computedStats.progressPercent}%</span>
                  </div>
                  <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500 shadow-sm" 
                      style={{ width: `${computedStats.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
                    <span className="block text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">Môn giảng dạy</span>
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <BookOpen size={16} className="text-indigo-600" />
                      {classDetail?.subject || student.lastSubject || 'Toán học'}
                    </span>
                  </div>
                  <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50">
                    <span className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Trạng thái học tập</span>
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      {student.status}
                    </span>
                  </div>
                </div>
              </div>
            </SectionPanel>

            {/* Panel 2: Learning Timeline (Database Reports) */}
            <SectionPanel title="Đánh giá & Báo cáo quá trình" icon={<ClipboardList size={20} className="text-indigo-600" />}>
              {loadingReports ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                  <Icon icon="lucide:loader-2" className="animate-spin text-indigo-600" fontSize={32} />
                  <p className="text-slate-500 text-sm">Đang tải báo cáo học tập...</p>
                </div>
              ) : reports.length > 0 ? (
                <div className="relative border-l-2 border-slate-100 pl-6 ml-3 flex flex-col gap-8 py-2">
                  {reports.map((report) => (
                    <TimelineItem 
                      key={report.id}
                      title={`Báo cáo buổi dạy`}
                      date={new Date(report.reportDate || report.createdAt).toLocaleDateString('vi-VN')}
                      time={new Date(report.reportDate || report.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                      content={report.content}
                      homework={report.homework}
                      progressRating={report.progressRating}
                      attendanceStatus={report.attendanceStatus}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center flex flex-col items-center justify-center gap-4 max-w-sm mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                    <Icon icon="lucide:clipboard-list" fontSize={28} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-slate-800">Chưa có báo cáo nào</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Bạn chưa nộp bất kỳ báo cáo học tập nào cho học viên này. Hãy nhấn nút phía trên để nộp báo cáo đầu tiên lên database.
                    </p>
                  </div>
                </div>
              )}
            </SectionPanel>
          </div>

          {/* Right Column: Statistics & Contacts */}
          <div className="flex flex-col gap-6">
            
            {/* Panel 3: Quick Stats */}
            <SectionPanel title="Thống kê nhanh" icon={<BarChart2 size={20} className="text-indigo-600" />}>
              <div className="grid grid-cols-2 gap-4">
                <StatBox value={String(computedStats.attended)} label="Đã học (buổi)" color="#4f46e5" />
                <StatBox value={`${computedStats.homeworkRate}%`} label="Tỷ lệ làm bài" color="#10b981" />
                <StatBox value={String(computedStats.absent)} label="Vắng mặt" color="#ef4444" />
                <StatBox value={computedStats.gpa} label="Đánh giá chung" color="#f59e0b" hasStar />
              </div>
            </SectionPanel>

            {/* Panel 4: Contact Info */}
            <SectionPanel title="Thông tin liên hệ" icon={<Contact size={20} className="text-indigo-600" />}>
              <div className="flex flex-col gap-4">
                <InfoItem label="Email học viên" value={student.email} icon="lucide:mail" />
                <InfoItem label="Số điện thoại" value={student.phone || "Không có"} icon="lucide:phone" />
              </div>
            </SectionPanel>
          </div>
        </div>
      </div>

      {/* --- ADD LEARNING REPORT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div 
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Quản lý báo cáo: {classDetail?.subject || 'Toán học'}</h3>
                <p className="text-xs text-blue-800 mt-1 font-semibold">Học viên: {student.fullName}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer">
                <Icon icon="lucide:x" fontSize={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Form Nhập liệu */}
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Icon icon="lucide:plus-circle" />
                  Viết báo cáo buổi học mới
                </h4>
                
                <textarea 
                  className="w-full p-3 border border-slate-200 rounded-lg mb-3 min-h-[100px] text-sm outline-none focus:border-blue-500 transition-all font-medium text-slate-800" 
                  placeholder="Nội dung kiến thức đã dạy..."
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  required
                />
                
                <input 
                  className="w-full p-3 border border-slate-200 rounded-lg mb-3 text-sm outline-none focus:border-blue-500 font-medium text-slate-800" 
                  placeholder="Bài tập về nhà..."
                  value={reportHomework}
                  onChange={(e) => setReportHomework(e.target.value)}
                />
                
                <div className="flex justify-between items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={attendanceStatus}
                      onChange={(e) => setAttendanceStatus(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium text-slate-700">Học viên có đi học</span>
                  </label>
                  
                  <select 
                     className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-700 outline-none"
                     value={progressRating}
                     onChange={(e) => setProgressRating(e.target.value)}
                  >
                    <option value="good">Đánh giá: Tốt</option>
                    <option value="fair">Đánh giá: Khá</option>
                    <option value="excellent">Đánh giá: Xuất sắc</option>
                    <option value="poor">Đánh giá: Cần cố gắng</option>
                  </select>
                  
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-lg font-medium transition-colors bg-white cursor-pointer text-sm"
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer border-none text-sm"
                    >
                      {submitting ? 'Đang lưu...' : 'Lưu'}
                    </button>
                  </div>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Subcomponent: Section Panel Container
function SectionPanel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
        {icon}
        <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// Subcomponent: Timeline Item for Reports
function TimelineItem({ 
  title, 
  date, 
  time, 
  content, 
  homework, 
  progressRating, 
  attendanceStatus 
}: { 
  title: string; 
  date: string; 
  time: string; 
  content: string; 
  homework?: string; 
  progressRating?: string; 
  attendanceStatus?: boolean; 
}) {
  
  const ratingDetails = useMemo(() => {
    const rating = String(progressRating).toLowerCase();
    if (rating === 'excellent') return { text: 'Xuất sắc', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (rating === 'good') return { text: 'Tốt', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (rating === 'fair') return { text: 'Trung bình', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    return { text: 'Yếu', color: 'bg-red-50 text-red-700 border-red-200' };
  }, [progressRating]);

  return (
    <div className="relative group">
      
      {/* Icon status indicator */}
      <span className="absolute -left-[37px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-white ring-4 ring-white border-2 border-slate-200 group-hover:border-indigo-500 transition-colors duration-200">
        <span className={`h-2.5 w-2.5 rounded-full ${
          attendanceStatus === false ? 'bg-red-500' : 'bg-indigo-600'
        }`} />
      </span>

      {/* Report body box */}
      <div className="bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl p-5 shadow-sm transition-all duration-200 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/50 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">{title}</span>
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 border rounded-full ${ratingDetails.color}`}>
              {ratingDetails.text}
            </span>
          </div>
          <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
            <Icon icon="lucide:clock" fontSize={12} />
            {date} · {time}
          </span>
        </div>
        
        <div className="flex flex-col gap-2">
          {/* Main class content */}
          <div className="text-sm font-medium text-slate-650 leading-relaxed whitespace-pre-line">
            {content}
          </div>

          {/* Homework if present */}
          {homework && homework.trim() && (
            <div className="mt-2 bg-indigo-50/30 border border-indigo-100/30 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                <Target size={12} />
                Bài tập & Nhận xét
              </span>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed whitespace-pre-line">{homework}</p>
            </div>
          )}

          {/* Attendance status badge in box */}
          <div className="flex items-center gap-1 mt-1">
            <span className={`h-1.5 w-1.5 rounded-full ${attendanceStatus === false ? 'bg-red-500' : 'bg-emerald-500'}`} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {attendanceStatus === false ? 'Vắng mặt' : 'Có mặt đầy đủ'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Stat Box for metrics
function StatBox({ value, label, color = "#4f46e5", hasStar = false }: { value: string; label: string; color?: string; hasStar?: boolean }) {
  return (
    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 text-center shadow-inner flex flex-col gap-1 items-center justify-center">
      <div className="text-2xl font-black flex items-center gap-1" style={{ color }}>
        {value} {hasStar && <Star size={18} fill="#f59e0b" className="text-amber-500" />}
      </div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  );
}

// Subcomponent: Contact Info Row
function InfoItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-start gap-3 bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 shadow-inner">
      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
        <Icon icon={icon} fontSize={18} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</span>
        <span className="text-sm font-bold text-slate-800 truncate">{value}</span>
      </div>
    </div>
  );
}
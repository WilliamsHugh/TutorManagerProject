'use client';

import { Icon } from '@iconify/react';

interface LearningReportModalProps {
  reportingClass: any;
  reports: any[];
  isEditingReport: string | null;
  reportFormData: {
    content: string;
    homework: string;
    progressRating: string;
    attendanceStatus: boolean;
  };
  setReportFormData: (data: any) => void;
  setIsEditingReport: (id: string | null) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: (id: string) => void;
}

export function LearningReportModal({
  reportingClass,
  reports,
  isEditingReport,
  reportFormData,
  setReportFormData,
  setIsEditingReport,
  onClose,
  onSave,
  onDelete,
}: LearningReportModalProps) {
  if (!reportingClass) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Quản lý báo cáo: {reportingClass.name}</h3>
            <p className="text-xs text-blue-800 mt-1 font-semibold">Học viên: {reportingClass.student}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
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
              className="w-full p-3 border border-slate-200 rounded-lg mb-3 min-h-[100px] text-sm outline-none focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400" 
              placeholder="Nội dung kiến thức đã dạy..."
              value={reportFormData.content}
              onChange={(e) => setReportFormData({...reportFormData, content: e.target.value})}
            />
            <input 
              className="w-full p-3 border border-slate-200 rounded-lg mb-3 text-sm outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400" 
              placeholder="Bài tập về nhà..."
              value={reportFormData.homework}
              onChange={(e) => setReportFormData({...reportFormData, homework: e.target.value})}
            />
            <div className="flex justify-between items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={reportFormData.attendanceStatus}
                  onChange={(e) => setReportFormData({...reportFormData, attendanceStatus: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700">Học viên có đi học</span>
              </label>
              <select 
                 className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 cursor-pointer outline-none"
                 value={reportFormData.progressRating}
                 onChange={(e) => setReportFormData({...reportFormData, progressRating: e.target.value})}
              >
                <option value="good">Đánh giá: Tốt</option>
                <option value="fair">Đánh giá: Khá</option>
                <option value="excellent">Đánh giá: Xuất sắc</option>
                <option value="poor">Đánh giá: Cần cố gắng</option>
              </select>
              <button onClick={onSave} className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer">Lưu</button>
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
                    <button 
                      onClick={() => { 
                        setIsEditingReport(r.id); 
                        setReportFormData({ 
                          content: r.content, 
                          homework: r.homework, 
                          progressRating: r.progressRating, 
                          attendanceStatus: r.attendanceStatus ?? true 
                        }); 
                      }} 
                      className="text-blue-600 font-semibold cursor-pointer"
                    >
                      Sửa
                    </button>
                    <button onClick={() => onDelete(r.id)} className="text-red-500 font-semibold cursor-pointer">Xóa</button>
                  </div>
                </div>
                <p className="text-sm text-slate-700 font-medium">{r.content}</p>
                {r.homework && (
                  <p className="text-xs text-slate-500 mt-1 italic">Bài tập: {r.homework}</p>
                )}
              </div>
            ))}
            {reports.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-4 italic">Chưa có lịch sử báo cáo nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

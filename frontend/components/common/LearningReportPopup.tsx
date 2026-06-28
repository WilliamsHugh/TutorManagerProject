"use client";

import { useEffect, useState } from "react";
import {
  X,
  FileText,
  CheckCircle2,
  XCircle,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

export interface LearningReport {
  id: string;
  reportDate: string;
  content: string;
  homework: string | null;
  progressRating: string | null;
  attendanceStatus: boolean | null;
  tutor?: {
    user?: {
      fullName?: string;
      email?: string;
    };
  };
  class?: {
    subject?: { name?: string };
  };
}

interface LearningReportPopupProps {
  reports: LearningReport[];
  isLoading: boolean;
  error: string | null;
  title: string;
  subtitle?: string;
  onClose: () => void;
  /** If only showing a single report for a session, show simpler UI */
  singleReportMode?: boolean;
}

const PROGRESS_LABELS: Record<string, string> = {
  excellent: "Xuất sắc",
  good: "Tốt",
  fair: "Trung bình",
  poor: "Yếu",
};

const PROGRESS_COLORS: Record<string, string> = {
  excellent: "bg-emerald-100 text-emerald-700 border-emerald-200",
  good: "bg-blue-100 text-blue-700 border-blue-200",
  fair: "bg-amber-100 text-amber-700 border-amber-200",
  poor: "bg-red-100 text-red-700 border-red-200",
};

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function ReportCard({ report, highlight }: { report: LearningReport; highlight?: boolean }) {
  const rating = report.progressRating?.toLowerCase();
  const progressLabel = rating ? PROGRESS_LABELS[rating] : null;
  const progressColor = rating ? PROGRESS_COLORS[rating] : null;

  return (
    <div
      className={`rounded-xl border ${
        highlight ? "border-[#0b5fff] ring-1 ring-[#0b5fff]/20 bg-blue-50/30" : "border-[#e2e8f0] bg-white"
      } p-4 text-sm space-y-3 shadow-sm transition-all`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0b5fff]/10 text-[#0b5fff] font-bold text-sm">
            {report.tutor?.user?.fullName?.charAt(0)?.toUpperCase() || "G"}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#0f172a] truncate">
              {report.tutor?.user?.fullName || "Gia sư"}
            </p>
            <p className="text-xs text-[#64748b] flex items-center gap-1 mt-0.5">
              <Calendar size={12} />
              {formatDate(report.reportDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          {progressLabel && progressColor && (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${progressColor}`}
            >
              {progressLabel}
            </span>
          )}
          {report.attendanceStatus !== null && (
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                report.attendanceStatus
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {report.attendanceStatus ? (
                <>
                  <CheckCircle2 size={10} /> Có mặt
                </>
              ) : (
                <>
                  <XCircle size={10} /> Vắng
                </>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Nội dung báo cáo */}
      {report.content && (
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <p className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider block mb-1.5">
            Nội dung buổi học
          </p>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
            {report.content}
          </p>
        </div>
      )}

      {/* Bài tập về nhà */}
      {report.homework && (
        <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100">
          <p className="font-semibold text-amber-600 text-[10px] uppercase tracking-wider block mb-1.5">
            Bài tập về nhà
          </p>
          <p className="text-amber-900 leading-relaxed whitespace-pre-wrap text-sm">
            {report.homework}
          </p>
        </div>
      )}

      {/* Subject info */}
      {report.class?.subject?.name && (
        <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
          <BookOpen size={13} />
          <span>Môn: {report.class.subject.name}</span>
        </div>
      )}
    </div>
  );
}

export default function LearningReportPopup({
  reports,
  isLoading,
  error,
  title,
  subtitle,
  onClose,
  singleReportMode = false,
}: LearningReportPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when reports change
  useEffect(() => {
    setCurrentIndex(0);
  }, [reports.length]);

  const hasMultiple = reports.length > 1;
  const currentReport = reports[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-[#0f172a] truncate flex items-center gap-2">
              <FileText size={16} className="text-[#0b5fff] shrink-0" />
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#64748b] mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#64748b] hover:bg-slate-100 hover:text-[#0f172a] transition-colors shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 flex-1 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 size={36} className="text-[#0b5fff] animate-spin mb-3" />
              <p className="text-sm text-[#64748b]">Đang tải báo cáo...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mb-3">
                <XCircle size={28} className="text-rose-500" />
              </div>
              <p className="text-sm font-semibold text-rose-700 mb-1">
                Không thể tải báo cáo
              </p>
              <p className="text-xs text-rose-500">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <FileText size={28} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-[#0f172a] mb-1">
                Chưa có báo cáo
              </p>
              <p className="text-xs text-[#64748b] max-w-xs">
                {singleReportMode
                  ? "Gia sư chưa viết báo cáo cho buổi học này."
                  : "Gia sư chưa viết báo cáo học tập cho lớp này."}
              </p>
            </div>
          ) : singleReportMode && currentReport ? (
            <ReportCard report={currentReport} highlight />
          ) : (
            <>
              {/* Navigation for multiple reports */}
              {hasMultiple && (
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1 text-xs font-semibold text-[#0b5fff] hover:underline disabled:text-slate-300 disabled:no-underline transition-colors"
                  >
                    <ChevronLeft size={14} />
                    Trước
                  </button>
                  <span className="text-xs font-medium text-[#64748b]">
                    {currentIndex + 1} / {reports.length}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentIndex((p) => Math.min(reports.length - 1, p + 1))
                    }
                    disabled={currentIndex === reports.length - 1}
                    className="flex items-center gap-1 text-xs font-semibold text-[#0b5fff] hover:underline disabled:text-slate-300 disabled:no-underline transition-colors"
                  >
                    Sau
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* Current report */}
              {currentReport && <ReportCard report={currentReport} />}

              {/* Report list count */}
              <div className="text-center text-xs text-[#94a3b8] pt-2 border-t border-slate-100">
                Tổng số {reports.length} báo cáo cho lớp học này
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

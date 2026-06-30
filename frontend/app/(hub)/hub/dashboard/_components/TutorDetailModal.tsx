"use client";

import React from "react";
import { ChevronLeft, FileText } from "lucide-react";

interface TutorDetailModalProps {
  tutor: any;
  onClose: () => void;
  onApprove: (id: string, status: "approved" | "rejected") => void;
  onDelete: (id: string) => void;
}

export function TutorDetailModal({
  tutor,
  onClose,
  onApprove,
  onDelete,
}: TutorDetailModalProps) {
  if (!tutor) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#1e293b] border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-6 p-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Phiếu Phê duyệt Hồ sơ gia sư (ADMIN_BM2)
            </h3>
            <p className="text-xs text-slate-400">Xem xét trình độ học vấn, kinh nghiệm giảng dạy và số CCCD</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#0f172a] border border-slate-800 hover:bg-slate-800 text-slate-400 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-500">Họ và tên gia sư:</span>
            <p className="font-semibold text-white">{tutor.user?.fullName}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500">Số CCCD hợp lệ:</span>
            <p className="font-semibold text-white font-mono">{tutor.idCardNumber || "—"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500">Trình độ học vấn:</span>
            <p className="font-semibold text-white">{tutor.educationLevel || "Chưa cập nhật"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500">Chuyên ngành học:</span>
            <p className="font-semibold text-white">{tutor.major || "Chưa cập nhật"}</p>
          </div>
          <div className="space-y-1 col-span-2">
            <span className="text-slate-500">Khu vực đăng ký dạy:</span>
            <p className="font-semibold text-white">{tutor.availableAreas || "Toàn thành phố"}</p>
          </div>
          <div className="space-y-1 col-span-2">
            <span className="text-slate-500">Môn học đăng ký dạy:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {tutor.subjects && tutor.subjects.map((sub: string) => (
                <span key={sub} className="px-1.5 py-0.5 rounded bg-[#0f172a] text-[10px] text-yellow-500 border border-slate-800">
                  {sub}
                </span>
              ))}
              {(!tutor.subjects || tutor.subjects.length === 0) && <span className="text-slate-600 italic text-[11px]">Chưa đăng ký</span>}
            </div>
          </div>
          <div className="space-y-1 col-span-2">
            <span className="text-slate-500">Kinh nghiệm giảng dạy (mô tả chi tiết):</span>
            <p className="bg-[#0f172a] p-3 rounded-lg border border-slate-800 text-slate-300 leading-relaxed max-h-28 overflow-y-auto">
              {tutor.experience || "Không có thông tin mô tả chi tiết kinh nghiệm giảng dạy."}
            </p>
          </div>

          {/* CV Download */}
          <div className="col-span-2">
            <div className="bg-[#0f172a] p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-xs">CV / Bằng cấp, chứng chỉ đính kèm:</span>
              <div className="mt-2">
                {tutor.cvUrl ? (
                  <a
                    href={tutor.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors hover:bg-yellow-500/10 hover:border-yellow-500/50"
                    style={{
                      borderColor: "rgba(255,255,255,0.15)",
                      color: "#fbbf24",
                    }}
                  >
                    <FileText size={16} />
                    Xem CV / Chứng chỉ
                    <span className="text-[10px] text-slate-400 ml-1">(Mở tab mới)</span>
                  </a>
                ) : (
                  <span className="text-slate-600 italic text-[11px]">Không có file đính kèm</span>
                )}
              </div>
            </div>
          </div>
          {tutor.approvedBy && (
            <div className="col-span-2 bg-[#0f172a] p-3 rounded-lg border border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div>
                <span>Người phê duyệt:</span>
                <p className="font-bold text-slate-300">{tutor.approvedBy?.fullName}</p>
              </div>
              <div>
                <span>Ngày phê duyệt:</span>
                <p className="font-bold text-slate-300">
                  {new Date(tutor.approvedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Approval Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => onDelete(tutor.user?.id)}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer mr-auto"
          >
            Xóa vĩnh viễn
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
          >
            Hủy bỏ
          </button>
          {tutor.approvalStatus !== "rejected" && (
            <button
              onClick={() => onApprove(tutor.id, "rejected")}
              className="bg-rose-900/40 hover:bg-rose-900 text-rose-300 border border-rose-800 hover:border-rose-600 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
            >
              Từ chối hồ sơ
            </button>
          )}
          {tutor.approvalStatus !== "approved" && (
            <button
              onClick={() => onApprove(tutor.id, "approved")}
              className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold px-5 py-2 rounded-lg cursor-pointer"
            >
              Phê duyệt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

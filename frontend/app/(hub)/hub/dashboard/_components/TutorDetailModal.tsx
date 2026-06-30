"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, FileText, Mail, CheckCircle2, AlertTriangle } from "lucide-react";

interface TutorDetailModalProps {
  tutor: any;
  onClose: () => void;
  onApprove: (id: string, status: "approved" | "rejected", systemEmail?: string) => void;
  onDelete: (id: string) => void;
}

export function TutorDetailModal({
  tutor,
  onClose,
  onApprove,
  onDelete,
}: TutorDetailModalProps) {
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [approving, setApproving] = useState(false);

  // Tự động sinh email hệ thống từ tên
  const autoSystemEmail = useMemo(() => {
    if (!tutor?.user?.fullName?.trim()) {
      return `tutor${Date.now()}@tutoredu.com`;
    }
    const name = tutor.user.fullName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, ".")
      .replace(/\.+/g, ".")
      .replace(/^\.|\.$/g, "");
    if (!name) {
      return `tutor${Date.now()}@tutoredu.com`;
    }
    return `${name}@tutoredu.com`;
  }, [tutor]);

  const [systemEmail, setSystemEmail] = useState("");

  // Reset form khi mở modal mới
  React.useEffect(() => {
    if (tutor) {
      setSystemEmail(autoSystemEmail);
      setShowApproveForm(false);
      setApproving(false);
    }
  }, [tutor, autoSystemEmail]);

  if (!tutor) return null;

  const handleApprove = async () => {
    setApproving(true);
    try {
      await onApprove(tutor.id, "approved", systemEmail);
      // Parent component sẽ đóng modal nếu thành công
    } catch {
      // Lỗi đã được handle bởi parent (showToast), modal vẫn mở
    } finally {
      setApproving(false); // Luôn reset loading state
    }
  };

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
            <p className="font-semibold text-white">
              {tutor.province ? `${tutor.district ? tutor.district + ", " : ""}${tutor.province}` : tutor.availableAreas || "Toàn thành phố"}
            </p>
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

          {/* Email hiển thị */}
          {tutor.user?.email && (
            <div className="col-span-2 bg-[#0f172a] p-3 rounded-lg border border-slate-800 space-y-2">
              <div>
                <span className="text-slate-500 text-xs">Email cá nhân (nhận thông báo):</span>
                <p className="font-semibold text-emerald-400 mt-0.5">
                  {tutor.user.contactEmail || tutor.user.email}
                </p>
              </div>
              {tutor.user.contactEmail && (
                <div>
                  <span className="text-slate-500 text-xs">Email hệ thống (dùng đăng nhập):</span>
                  <p className="font-semibold text-blue-400 mt-0.5">
                    {tutor.user.email}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form cấp email hệ thống khi phê duyệt */}
        {showApproveForm && (
          <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Mail size={14} />
              <span>Cấp email hệ thống cho gia sư</span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Email hệ thống (dùng để đăng nhập)</label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={systemEmail}
                  onChange={(e) => setSystemEmail(e.target.value)}
                  className="flex-1 bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-emerald-500 transition-colors"
                  placeholder="tutor@tutoredu.com"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Email này sẽ được dùng để đăng nhập hệ thống. Mật khẩu tạm thời sẽ được gửi tới email cá nhân của gia sư.
              </p>
            </div>

            <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-300 leading-relaxed">
                Sau khi phê duyệt, hệ thống sẽ tự động gửi email thông báo trúng tuyển kèm mật khẩu tạm thời tới email cá nhân <strong className="text-amber-200">{tutor.user?.email}</strong>.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApproveForm(false)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                disabled={approving}
              >
                Quay lại
              </button>
              <button
                onClick={handleApprove}
                disabled={approving || !systemEmail}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {approving ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Xác nhận phê duyệt &amp; Gửi mail
                  </>
                )}
              </button>
            </div>
          </div>
        )}

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
          {tutor.approvalStatus !== "approved" && !showApproveForm && (
            <button
              onClick={() => setShowApproveForm(true)}
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

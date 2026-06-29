"use client";

import React from "react";
import { XCircle } from "lucide-react";

interface LogDetailModalProps {
  log: any;
  onClose: () => void;
}

export function LogDetailModal({ log, onClose }: LogDetailModalProps) {
  if (!log) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#1e293b] border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-5 p-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Chi tiết hoạt động hệ thống
            </h3>
            <p className="text-xs text-slate-400">Xem thông tin chi tiết về tác vụ và thông tin người thực hiện</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#0f172a] border border-slate-800 hover:bg-slate-800 text-slate-400 cursor-pointer"
          >
            <XCircle size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          {/* Left Column: User details */}
          <div className="space-y-4 border-r border-slate-800 pr-4">
            <h4 className="font-bold text-yellow-500 uppercase tracking-wider text-[10px]">Người thực hiện (User)</h4>
            
            {log.user ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-slate-500">Họ và tên:</span>
                  <p className="font-semibold text-white text-sm">{log.user.fullName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500">Email hệ thống:</span>
                  <p className="font-semibold text-white font-mono">{log.user.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500">Vai trò (Role):</span>
                  <p className="font-semibold text-white capitalize">{log.user.role?.name || "Thành viên"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500">Mã định danh User ID:</span>
                  <p className="font-mono text-slate-400 text-[10px] select-all bg-black/30 p-1 rounded border border-white/5 truncate">{log.user.id}</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 italic">
                Tác vụ được thực hiện bởi Khách chưa đăng nhập (Guest)
              </div>
            )}
          </div>

          {/* Right Column: Log details */}
          <div className="space-y-4 pl-2">
            <h4 className="font-bold text-yellow-500 uppercase tracking-wider text-[10px]">Thông tin kỹ thuật tác vụ</h4>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-slate-500">Hành động:</span>
                <p className="font-semibold text-white">{log.action}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">Đường dẫn Route:</span>
                <p className="font-mono text-slate-300 bg-black/30 p-1.5 rounded border border-white/5 text-[10px] break-all">{log.method || "GET"} {log.route}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">Thời gian ghi nhận:</span>
                <p className="font-semibold text-white">{new Date(log.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">Địa chỉ IP khách:</span>
                <p className="font-semibold text-white font-mono">{log.ipAddress || "—"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">Trình duyệt/Thiết bị (User Agent):</span>
                <p className="text-[10px] text-slate-400 font-mono break-words leading-normal max-h-[60px] overflow-y-auto bg-black/20 p-1 rounded border border-white/5">{log.userAgent || "—"}</p>
              </div>
            </div>
          </div>

          {/* Bottom Row: Details body JSON */}
          {log.details && (
            <div className="col-span-2 space-y-2 pt-2 border-t border-slate-800">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Dữ liệu yêu cầu gửi kèm (Body/Details JSON):</span>
              <pre className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-[10px] text-green-400 font-mono overflow-auto max-h-[140px] select-all leading-normal">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
          >
            Đóng chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}

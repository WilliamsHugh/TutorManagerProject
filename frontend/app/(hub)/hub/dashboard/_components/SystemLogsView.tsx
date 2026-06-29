"use client";

import React from "react";
import { Settings, Search } from "lucide-react";
import { TablePagination } from "@/app/(hub)/staff/_components/TablePagination";

interface SystemLogsViewProps {
  systemLogs: any[];
  logsSearch: string;
  setLogsSearch: (val: string) => void;
  logsActionFilter: string;
  setLogsActionFilter: (val: string) => void;
  logsPage: number;
  setLogsPage: (page: number) => void;
  logsTotal: number;
  logsLimit: number;
  onSelectLog: (log: any) => void;
}

export function SystemLogsView({
  systemLogs,
  logsSearch,
  setLogsSearch,
  logsActionFilter,
  setLogsActionFilter,
  logsPage,
  setLogsPage,
  logsTotal,
  logsLimit,
  onSelectLog,
}: SystemLogsViewProps) {
  return (
    <div className="bg-[#1e293b] p-6 rounded-xl border border-[rgba(255,255,255,0.08)] space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="text-yellow-500" />
            Nhật ký hoạt động hệ thống
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Danh sách ghi nhận các hành vi thay đổi dữ liệu, đăng nhập và tác vụ quản trị
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm hành động, route, user..."
              className="pl-8 pr-3 h-9 rounded bg-[#0f172a] border border-slate-700 text-xs text-slate-200 outline-none w-56 focus:border-yellow-500 transition-colors"
              value={logsSearch}
              onChange={(e) => {
                setLogsSearch(e.target.value);
                setLogsPage(1);
              }}
            />
          </div>

          {/* Action Filter */}
          <select
            value={logsActionFilter}
            onChange={(e) => {
              setLogsActionFilter(e.target.value);
              setLogsPage(1);
            }}
            className="h-9 rounded bg-[#0f172a] border border-slate-700 text-xs text-slate-300 px-3 cursor-pointer outline-none custom-select"
          >
            <option value="">Tất cả hoạt động</option>
            <option value="Đăng nhập">Đăng nhập</option>
            <option value="Đăng ký tài khoản">Đăng ký tài khoản</option>
            <option value="Cấp tài khoản mới">Cấp tài khoản mới</option>
            <option value="Cập nhật trạng thái tài khoản">Cập nhật trạng thái tài khoản</option>
            <option value="Phê duyệt hồ sơ Gia sư">Phê duyệt hồ sơ Gia sư</option>
            <option value="Thêm môn học mới">Thêm môn học mới</option>
            <option value="Cập nhật môn học">Cập nhật môn học</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-white/5 rounded-lg bg-black/10">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/5">
              <th className="py-3 px-4">Thời gian</th>
              <th className="py-3 px-4">Người thực hiện</th>
              <th className="py-3 px-4">Hành động</th>
              <th className="py-3 px-4">Phương thức</th>
              <th className="py-3 px-4">Đường dẫn (Route)</th>
              <th className="py-3 px-4">Địa chỉ IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {systemLogs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => onSelectLog(log)}
              >
                <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                  {new Date(log.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                </td>
                <td className="py-3 px-4">
                  {log.user ? (
                    <div>
                      <div className="font-semibold text-white">{log.user.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.user.email}</div>
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">Khách (Guest)</span>
                  )}
                </td>
                <td className="py-3 px-4 font-semibold text-yellow-400">
                  {log.action}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    log.method === "POST" ? "bg-green-500/10 text-green-400" :
                    log.method === "PUT" ? "bg-blue-500/10 text-blue-400" :
                    log.method === "PATCH" ? "bg-amber-500/10 text-amber-400" :
                    log.method === "DELETE" ? "bg-red-500/10 text-red-400" : "bg-slate-800 text-slate-400"
                  }`}>
                    {log.method || "GET"}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-slate-300 text-[11px] max-w-[200px] truncate" title={log.route}>
                  {log.route}
                </td>
                <td className="py-3 px-4 text-slate-400 font-mono">
                  {log.ipAddress || "—"}
                </td>
              </tr>
            ))}
            {systemLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  Chưa có lịch sử nhật ký hoạt động nào được ghi nhận.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {logsTotal > logsLimit && (
        <div className="pt-2">
          <TablePagination
            currentPage={logsPage}
            totalItems={logsTotal}
            pageSize={logsLimit}
            onPageChange={setLogsPage}
            itemName="nhật ký"
          />
        </div>
      )}
    </div>
  );
}

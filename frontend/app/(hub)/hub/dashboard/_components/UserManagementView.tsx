"use client";

import React, { useState, useMemo } from "react";
import { Search, UserPlus, Edit2, Lock, Unlock, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/app/(hub)/staff/_components/TablePagination";

interface UserManagementViewProps {
  users: any[];
  usersPageSize?: number;
  onNavigateToView: (view: string) => void;
  onEditUser: (user: any) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onDeleteUser: (userId: string) => void;
}

export function UserManagementView({
  users,
  usersPageSize = 5,
  onNavigateToView,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
}: UserManagementViewProps) {
  const [searchUser, setSearchUser] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [usersPage, setUsersPage] = useState(1);

  // Filter users based on query and role
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = filterRole === "all" || u.role?.name === filterRole;
      const q = searchUser.trim().toLowerCase();
      if (!q) return matchRole;
      const matchQuery =
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q));
      return matchRole && matchQuery;
    });
  }, [users, searchUser, filterRole]);

  // Paginated chunk
  const paginatedUsers = useMemo(() => {
    const start = (usersPage - 1) * usersPageSize;
    return filteredUsers.slice(start, start + usersPageSize);
  }, [filteredUsers, usersPage, usersPageSize]);

  // Reset page when filters change
  React.useEffect(() => {
    setUsersPage(1);
  }, [searchUser, filterRole]);

  return (
    <div className="bg-[#1e293b] p-6 rounded-xl border border-[rgba(255,255,255,0.08)] space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Danh sách Tài khoản người dùng</h2>
          <p className="text-xs text-slate-400 mt-1">Biểu mẫu thông tin tài khoản hệ thống (ADMIN_BM1)</p>
        </div>
        <button
          onClick={() => onNavigateToView("create-account")}
          className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer self-start"
        >
          <UserPlus size={14} /> Cấp tài khoản mới
        </button>
      </div>

      {/* Filter controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-9 rounded pl-9 text-xs bg-[#0f172a] border-slate-700 text-white placeholder-slate-500"
            placeholder="Tìm theo họ tên, email hoặc SĐT..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />
        </div>

        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full h-9 rounded text-xs bg-[#0f172a] border border-slate-700 text-slate-300 px-3 cursor-pointer outline-none custom-select"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản trị viên (Admin)</option>
            <option value="staff">Nhân viên (Staff)</option>
            <option value="tutor">Gia sư (Tutor)</option>
            <option value="student">Học viên (Student)</option>
          </select>
        </div>
      </div>

      {/* Table Users */}
      <div className="overflow-x-auto rounded border border-slate-800">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#131d31] text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Họ và tên</th>
              <th className="px-4 py-3">Email đăng nhập</th>
              <th className="px-4 py-3">Số điện thoại</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Ngày tạo</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-[#1e293b]">
            {paginatedUsers.map((u, idx) => (
              <tr
                key={u.id}
                className="hover:bg-[#25354e]/40 transition-colors stagger-item"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <td className="px-4 py-3 font-semibold text-white">{u.fullName}</td>
                <td className="px-4 py-3 text-slate-300">{u.email}</td>
                <td className="px-4 py-3 text-slate-300">{u.phone || "—"}</td>
                <td className="px-4 py-3">
                  <Badge
                    className={`rounded font-mono px-2 py-0.5 text-[10px] text-white ${
                      u.role?.name === "admin"
                        ? "bg-purple-900/60 text-purple-200 border-purple-800"
                        : u.role?.name === "staff"
                        ? "bg-yellow-950/60 text-yellow-300 border-yellow-800"
                        : u.role?.name === "tutor"
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                        : "bg-blue-950/60 text-blue-300 border-blue-800"
                    }`}
                  >
                    {u.role?.name.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-[11px] ${u.isActive ? "text-emerald-400" : "text-rose-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-emerald-400" : "bg-rose-400"}`}></span>
                    {u.isActive ? "Hoạt động" : "Bị khóa"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-4 py-3 text-right space-x-1.5">
                  <button
                    onClick={() => onEditUser(u)}
                    className="p-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    title="Sửa chi tiết"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => onToggleStatus(u.id, u.isActive)}
                    className={`p-1.5 rounded border border-slate-700 bg-slate-800 cursor-pointer ${
                      u.isActive ? "hover:bg-rose-950/30 hover:text-rose-400" : "hover:bg-emerald-950/30 hover:text-emerald-400"
                    }`}
                    title={u.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                  >
                    {u.isActive ? <Lock size={12} /> : <Unlock size={12} />}
                  </button>
                  <button
                    onClick={() => onDeleteUser(u.id)}
                    className="p-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-rose-950/30 hover:text-rose-400 text-slate-300 cursor-pointer"
                    title="Xóa tài khoản"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-medium">
                  Không tìm thấy tài khoản người dùng nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredUsers.length > usersPageSize && (
        <TablePagination
          currentPage={usersPage}
          totalItems={filteredUsers.length}
          pageSize={usersPageSize}
          onPageChange={setUsersPage}
          itemName="tài khoản"
        />
      )}
    </div>
  );
}

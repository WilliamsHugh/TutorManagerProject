"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";

interface UserEditModalProps {
  user: any;
  onClose: () => void;
  onSave: (updatedUser: any) => void;
}

export function UserEditModal({ user, onClose, onSave }: UserEditModalProps) {
  const [localUser, setLocalUser] = useState({ ...user });

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localUser);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#1e293b] border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="text-base font-bold text-white">Chỉnh sửa thông tin tài khoản</h3>
          <p className="text-xs text-slate-400">Thay đổi thông tin liên lạc hoặc vai trò (BM1)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">Họ và tên</label>
              <Input
                className="bg-[#0f172a] border-slate-700 text-white h-9"
                value={localUser.fullName}
                onChange={(e) => setLocalUser({ ...localUser, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Email đăng nhập</label>
              <Input
                type="email"
                className="bg-[#0f172a] border-slate-700 text-white h-9"
                value={localUser.email}
                onChange={(e) => setLocalUser({ ...localUser, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Số điện thoại</label>
              <Input
                className="bg-[#0f172a] border-slate-700 text-white h-9"
                value={localUser.phone || ""}
                onChange={(e) => setLocalUser({ ...localUser, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Địa chỉ thường trú</label>
              <Input
                className="bg-[#0f172a] border-slate-700 text-white h-9"
                value={localUser.address || ""}
                onChange={(e) => setLocalUser({ ...localUser, address: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Vai trò</label>
              <select
                value={localUser.roleName || localUser.role?.name}
                onChange={(e) => setLocalUser({ ...localUser, roleName: e.target.value })}
                className="w-full h-9 rounded bg-[#0f172a] border border-slate-700 text-slate-300 px-3 cursor-pointer outline-none custom-select"
              >
                <option value="admin">Quản trị viên (Admin)</option>
                <option value="staff">Nhân viên trung tâm (Staff)</option>
                <option value="tutor">Gia sư (Tutor)</option>
                <option value="student">Học viên (Student)</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                checked={localUser.isActive}
                onChange={(e) => setLocalUser({ ...localUser, isActive: e.target.checked })}
                className="accent-yellow-500 w-4 h-4 cursor-pointer"
                id="isActiveCheckbox"
              />
              <label htmlFor="isActiveCheckbox" className="text-slate-300 cursor-pointer font-semibold">
                Kích hoạt tài khoản này hoạt động
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

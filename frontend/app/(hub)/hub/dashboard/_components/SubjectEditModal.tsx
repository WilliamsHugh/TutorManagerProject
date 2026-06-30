"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";

interface SubjectEditModalProps {
  subject: any;
  onClose: () => void;
  onSave: (updatedSubject: any) => void;
}

export function SubjectEditModal({
  subject,
  onClose,
  onSave,
}: SubjectEditModalProps) {
  const [localSubject, setLocalSubject] = useState({ ...subject });

  if (!subject) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSubject);
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
          <h3 className="text-base font-bold text-white">Chỉnh sửa môn học</h3>
          <p className="text-xs text-slate-400">Thay đổi thông tin môn học giảng dạy</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">Tên môn học *</label>
              <Input
                className="bg-[#0f172a] border-slate-700 text-white h-9"
                value={localSubject.name}
                onChange={(e) => setLocalSubject({ ...localSubject, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Cấp lớp</label>
              <Input
                className="bg-[#0f172a] border-slate-700 text-white h-9"
                value={localSubject.gradeLevel || ""}
                onChange={(e) => setLocalSubject({ ...localSubject, gradeLevel: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Mô tả môn học</label>
              <textarea
                rows={3}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-md p-2.5 text-xs text-white outline-none focus:border-yellow-500"
                value={localSubject.description || ""}
                onChange={(e) => setLocalSubject({ ...localSubject, description: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                checked={localSubject.isActive}
                onChange={(e) => setLocalSubject({ ...localSubject, isActive: e.target.checked })}
                className="accent-yellow-500 w-4 h-4 cursor-pointer"
                id="isActiveSubCheckbox"
              />
              <label htmlFor="isActiveSubCheckbox" className="text-slate-300 cursor-pointer font-semibold">
                Kích hoạt môn học hoạt động
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
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { Plus, Edit2, Lock, Unlock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/app/(hub)/staff/_components/TablePagination";

interface SubjectManagementViewProps {
  subjects: any[];
  subjectsPageSize?: number;
  onCreateSubject: (subjectData: { name: string; gradeLevel: string; description: string }) => void;
  onEditSubject: (subject: any) => void;
  onToggleStatus: (subjectId: string, currentStatus: boolean) => void;
}

export function SubjectManagementView({
  subjects,
  subjectsPageSize = 5,
  onCreateSubject,
  onEditSubject,
  onToggleStatus,
}: SubjectManagementViewProps) {
  const [subjectsPage, setSubjectsPage] = useState(1);
  const [newSubject, setNewSubject] = useState({
    name: "",
    gradeLevel: "",
    description: "",
  });

  // Paginated list
  const paginatedSubjects = useMemo(() => {
    const start = (subjectsPage - 1) * subjectsPageSize;
    return subjects.slice(start, start + subjectsPageSize);
  }, [subjects, subjectsPage, subjectsPageSize]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateSubject(newSubject);
    setNewSubject({ name: "", gradeLevel: "", description: "" });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Create Subject Card */}
      <div className="bg-[#1e293b] p-6 rounded-xl border border-[rgba(255,255,255,0.08)] h-fit space-y-4">
        <div>
          <h3 className="text-base font-bold">Thêm môn học mới</h3>
          <p className="text-xs text-slate-400 mt-0.5">Thêm nhanh môn học trung tâm đang dạy</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Tên môn học *</label>
            <Input
              className="bg-[#0f172a] border-slate-700 text-xs text-white h-9"
              placeholder="Ví dụ: Toán, Lý, Tiếng Anh, IELTS..."
              value={newSubject.name}
              onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Cấp lớp học</label>
            <Input
              className="bg-[#0f172a] border-slate-700 text-xs text-white h-9"
              placeholder="Ví dụ: Cấp 3, Luyện Thi, Lớp 10..."
              value={newSubject.gradeLevel}
              onChange={(e) => setNewSubject({ ...newSubject, gradeLevel: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Mô tả môn học</label>
            <textarea
              rows={3}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-md p-2.5 text-xs text-white outline-none placeholder-slate-500 focus:border-yellow-500"
              placeholder="Mô tả tóm tắt chương trình giảng dạy..."
              value={newSubject.description}
              onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus size={14} /> Thêm môn học
          </button>
        </form>
      </div>

      {/* Subjects list */}
      <div className="bg-[#1e293b] p-6 rounded-xl border border-[rgba(255,255,255,0.08)] col-span-2 space-y-5">
        <div>
          <h3 className="text-base font-bold">Danh sách môn học giảng dạy</h3>
          <p className="text-xs text-slate-400 mt-0.5">Tổng số môn học hỗ trợ: {subjects.length}</p>
        </div>

        <div className="overflow-x-auto rounded border border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#131d31] text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Tên môn học</th>
                <th className="px-4 py-3">Cấp lớp</th>
                <th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-[#1e293b]">
              {paginatedSubjects.map((sub, idx) => (
                <tr
                  key={sub.id}
                  className="hover:bg-[#25354e]/40 transition-colors stagger-item"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <td className="px-4 py-3 font-semibold text-white">{sub.name}</td>
                  <td className="px-4 py-3 text-slate-300">{sub.gradeLevel || "Tất cả"}</td>
                  <td className="px-4 py-3 text-slate-400 truncate max-w-37.5" title={sub.description}>
                    {sub.description || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] ${sub.isActive ? "text-emerald-400" : "text-rose-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sub.isActive ? "bg-emerald-400" : "bg-rose-400"}`}></span>
                      {sub.isActive ? "Hoạt động" : "Đã ẩn"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1.5">
                    <button
                      onClick={() => onEditSubject(sub)}
                      className="p-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Sửa"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => onToggleStatus(sub.id, sub.isActive)}
                      className={`p-1.5 rounded border border-slate-700 bg-slate-800 cursor-pointer ${
                        sub.isActive ? "hover:bg-rose-950/30 hover:text-rose-400" : "hover:bg-emerald-950/30 hover:text-emerald-400"
                      }`}
                      title={sub.isActive ? "Ẩn môn học" : "Hiện môn học"}
                    >
                      {sub.isActive ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {subjects.length > subjectsPageSize && (
          <TablePagination
            currentPage={subjectsPage}
            totalItems={subjects.length}
            pageSize={subjectsPageSize}
            onPageChange={setSubjectsPage}
            itemName="môn học"
          />
        )}
      </div>
    </div>
  );
}

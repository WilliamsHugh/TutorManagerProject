"use client";

import React, { useState, useMemo } from "react";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/app/(hub)/staff/_components/TablePagination";

interface TutorApprovalViewProps {
  tutors: any[];
  tutorsPageSize?: number;
  onSelectTutor: (tutor: any) => void;
}

export function TutorApprovalView({
  tutors,
  tutorsPageSize = 4,
  onSelectTutor,
}: TutorApprovalViewProps) {
  const [filterTutorStatus, setFilterTutorStatus] = useState("all");
  const [tutorsPage, setTutorsPage] = useState(1);

  // Filter tutors locally
  const filteredTutors = useMemo(() => {
    return tutors.filter((t) => {
      if (filterTutorStatus === "all") return true;
      return t.approvalStatus === filterTutorStatus;
    });
  }, [tutors, filterTutorStatus]);

  // Paginate tutors
  const paginatedTutors = useMemo(() => {
    const start = (tutorsPage - 1) * tutorsPageSize;
    return filteredTutors.slice(start, start + tutorsPageSize);
  }, [filteredTutors, tutorsPage, tutorsPageSize]);

  // Reset page when filters change
  React.useEffect(() => {
    setTutorsPage(1);
  }, [filterTutorStatus]);

  return (
    <div className="bg-[#1e293b] p-6 rounded-xl border border-[rgba(255,255,255,0.08)] space-y-6">
      <div>
        <h2 className="text-xl font-bold">Danh sách Hồ sơ đăng ký gia sư</h2>
        <p className="text-xs text-slate-400 mt-1">Duyệt và kiểm tra thông tin hồ sơ của gia sư (ADMIN_BM2)</p>
      </div>

      {/* Filter status */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setFilterTutorStatus("all")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
            filterTutorStatus === "all" ? "bg-yellow-500 text-slate-950" : "text-slate-400 hover:text-white"
          }`}
        >
          Tất cả hồ sơ ({tutors.length})
        </button>
        <button
          onClick={() => setFilterTutorStatus("pending")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
            filterTutorStatus === "pending" ? "bg-yellow-500 text-slate-950" : "text-slate-400 hover:text-white"
          }`}
        >
          Chờ duyệt ({tutors.filter((t) => t.approvalStatus === "pending").length})
        </button>
        <button
          onClick={() => setFilterTutorStatus("approved")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
            filterTutorStatus === "approved" ? "bg-yellow-500 text-slate-950" : "text-slate-400 hover:text-white"
          }`}
        >
          Đã duyệt ({tutors.filter((t) => t.approvalStatus === "approved").length})
        </button>
        <button
          onClick={() => setFilterTutorStatus("rejected")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
            filterTutorStatus === "rejected" ? "bg-yellow-500 text-slate-950" : "text-slate-400 hover:text-white"
          }`}
        >
          Từ chối ({tutors.filter((t) => t.approvalStatus === "rejected").length})
        </button>
      </div>

      {/* Tutor list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedTutors.map((t, idx) => (
          <div
            key={t.id}
            className="bg-[#131d31] p-5 rounded-xl border border-slate-800 flex flex-col justify-between gap-4 stagger-item"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-white">{t.user?.fullName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{t.user?.email}</p>
                </div>
                <Badge
                  className={`rounded px-2.5 py-0.5 text-[10px] text-white ${
                    t.approvalStatus === "approved"
                      ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                      : t.approvalStatus === "rejected"
                      ? "bg-rose-950 text-rose-400 border-rose-800"
                      : "bg-amber-950 text-amber-400 border-amber-800 animate-pulse"
                  }`}
                >
                  {t.approvalStatus === "approved" && "ĐÃ DUYỆT"}
                  {t.approvalStatus === "rejected" && "TỪ CHỐI"}
                  {t.approvalStatus === "pending" && "CHỜ DUYỆT"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-slate-800 pt-3">
                <div>
                  <span className="text-slate-500">Học vị:</span>
                  <p className="font-semibold text-slate-300">{t.educationLevel || "Chưa cập nhật"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Chuyên ngành:</span>
                  <p className="font-semibold text-slate-300">{t.major || "Chưa cập nhật"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Môn giảng dạy:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {t.subjects && t.subjects.map((sub: string) => (
                      <span key={sub} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                        {sub}
                      </span>
                    ))}
                    {(!t.subjects || t.subjects.length === 0) && <span className="text-slate-600 italic">Chưa đăng ký</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <span className="text-[10px] text-slate-500">
                Đăng ký: {new Date(t.user?.createdAt).toLocaleDateString("vi-VN")}
              </span>
              <button
                onClick={() => onSelectTutor(t)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Eye size={12} /> Xem phiếu duyệt
              </button>
            </div>
          </div>
        ))}
        {filteredTutors.length === 0 && (
          <div className="col-span-2 py-8 text-center text-slate-500 font-medium">
            Không tìm thấy hồ sơ gia sư nào phù hợp.
          </div>
        )}
        {filteredTutors.length > tutorsPageSize && (
          <div className="col-span-2 mt-2">
            <TablePagination
              currentPage={tutorsPage}
              totalItems={filteredTutors.length}
              pageSize={tutorsPageSize}
              onPageChange={setTutorsPage}
              itemName="hồ sơ"
            />
          </div>
        )}
      </div>
    </div>
  );
}

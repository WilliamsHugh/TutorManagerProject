"use client"

import { useEffect, useState } from "react"
import { BookOpen, Clock, Mail, Phone, GraduationCap, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { getLearningReports } from "@/lib/api"
import type { StaffClassItem } from "@/types/staff"

export function getStatusBadge(status?: string, size: "sm" | "md" = "sm") {
  const sizeClasses = size === "sm"
    ? "px-2 py-0.5 text-[11px] rounded"
    : "px-2.5 py-1 text-xs rounded-md"

  switch (status) {
    case "Đang học":
      return (
        <Badge className={`bg-emerald-100 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 shadow-none ${sizeClasses}`}>
          Đang học
        </Badge>
      )
    case "Hoàn thành":
      return (
        <Badge className={`bg-blue-100 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 shadow-none ${sizeClasses}`}>
          Hoàn thành
        </Badge>
      )
    case "Đã hủy":
      return (
        <Badge className={`bg-red-100 hover:bg-red-100 text-red-700 font-semibold border border-red-200 shadow-none ${sizeClasses}`}>
          Đã hủy
        </Badge>
      )
    default:
      return (
        <Badge className={`bg-amber-100 hover:bg-amber-100 text-amber-700 font-semibold border border-amber-200 shadow-none ${sizeClasses}`}>
          {status || "Tạm dừng"}
        </Badge>
      )
  }
}

type ClassDetailDialogProps = {
  classItem: StaffClassItem
  onClose: () => void
}

export function ClassDetailDialog({ classItem, onClose }: ClassDetailDialogProps) {
  const [reports, setReports] = useState<any[]>([])
  const [loadingReports, setLoadingReports] = useState(true)

  useEffect(() => {
    async function loadReports() {
      if (!classItem.id) return
      try {
        const data = await getLearningReports(classItem.id)
        setReports(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingReports(false)
      }
    }
    loadReports()
  }, [classItem.id])

  const raw = classItem.raw
  const creationDate = raw?.request?.createdAt
    ? new Intl.DateTimeFormat("vi-VN").format(new Date(raw.request.createdAt))
    : "Chưa rõ"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-7"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sticky top-0 bg-white rounded-t-xl z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold">Chi tiết Lớp học: {classItem.code}</h2>
            {getStatusBadge(classItem.status, "md")}
          </div>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted"
            type="button"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1 text-sm">
          {/* Overview Info */}
          <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-muted-foreground text-xs font-semibold block mb-1 uppercase tracking-wider">Môn học</span>
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <BookOpen size={15} className="text-primary shrink-0" />
                <span>{classItem.subject}</span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-semibold block mb-1 uppercase tracking-wider">Ngày tạo lớp</span>
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Clock size={15} className="text-slate-400 shrink-0" />
                <span>{creationDate}</span>
              </div>
            </div>
          </div>

          {/* Operation info */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Thông tin vận hành</h4>
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="text-muted-foreground">Học phí:</span>
                <span className="font-bold text-foreground block mt-0.5">{classItem.feePerSession}đ / buổi</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tiến độ buổi học:</span>
                {loadingReports ? (
                  <span className="font-bold text-foreground block mt-0.5 animate-pulse">Đang tải...</span>
                ) : (
                  <span className="font-bold text-foreground block mt-0.5">
                    Đã học {reports.length} / {classItem.totalSessions}
                  </span>
                )}
              </div>
              <div>
                <span className="text-muted-foreground">Ngày bắt đầu:</span>
                <span className="font-semibold text-foreground block mt-0.5">{classItem.startDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Địa điểm học:</span>
                <span className="font-semibold text-foreground block mt-0.5 truncate" title={classItem.location}>{classItem.location}</span>
              </div>
            </div>
          </div>

          {/* Tutor Info */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Gia sư đảm nhận</h4>
            <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground mb-1 text-sm">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  {raw?.tutor?.user?.fullName?.charAt(0)?.toUpperCase() || "G"}
                </div>
                <span>{raw?.tutor?.user?.fullName || "Chưa phân công"}</span>
              </div>
              {raw?.tutor?.user && (
                <div className="grid grid-cols-2 gap-2 text-muted-foreground pl-1">
                  <div className="flex items-center gap-1.5">
                    <Mail size={12} className="shrink-0" />
                    <span className="truncate" title={raw.tutor.user.email}>{raw.tutor.user.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="shrink-0" />
                    <span>{raw.tutor.user.phone}</span>
                  </div>
                  {(raw.tutor.educationLevel || raw.tutor.major) && (
                    <div className="col-span-2 flex items-center gap-1.5">
                      <GraduationCap size={12} className="shrink-0" />
                      <span>
                        {raw.tutor.educationLevel}
                        {raw.tutor.major ? ` - ${raw.tutor.major}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Student Info */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Thông tin học viên</h4>
            <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-foreground mb-1 text-sm">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-bold">
                  {raw?.student?.user?.fullName?.charAt(0)?.toUpperCase() || "H"}
                </div>
                <span>{raw?.student?.user?.fullName || "Chưa cập nhật"}</span>
              </div>
              {raw?.student && (
                <div className="space-y-2 pl-1">
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Mail size={12} className="shrink-0" />
                      <span className="truncate" title={raw.student.user?.email}>{raw.student.user?.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="shrink-0" />
                      <span>{raw.student.user?.phone || "—"}</span>
                    </div>
                    <div className="col-span-2">
                      Lớp: <span className="font-semibold text-foreground">{raw.student.gradeLevel || "—"}</span> · Trường: <span className="font-semibold text-foreground">{raw.student.schoolName || "—"}</span>
                    </div>
                  </div>

                  {/* Parent info */}
                  {raw.student.parentName && (
                    <div className="pt-2 border-t border-slate-200/60 mt-1 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Phụ huynh đại diện</div>
                      <div className="font-bold text-foreground">{raw.student.parentName}</div>
                      <div className="grid grid-cols-2 gap-2 text-muted-foreground mt-0.5">
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="shrink-0" />
                          <span>{raw.student.parentPhone || "—"}</span>
                        </div>
                        {raw.student.parentEmail && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="shrink-0" />
                            <span className="truncate" title={raw.student.parentEmail}>{raw.student.parentEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {raw?.notes && (
            <div className="space-y-2">
              <span className="text-muted-foreground text-xs font-semibold block uppercase tracking-wider">Ghi chú lớp học</span>
              <div className="bg-amber-50/50 text-amber-900 text-xs p-3 rounded-lg border border-amber-100 whitespace-pre-wrap leading-relaxed">
                {raw.notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { BookOpen, Clock, Mail, Phone, GraduationCap, X, Calendar, FileText, CheckCircle2, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/common/Skeleton"
import {
  getLearningReports,
  getClassScheduleForStaff,
  createClassSchedule,
  updateClassSchedule,
  deleteClassSchedule,
  updateClassStatusForStaff,
} from "@/lib/api"
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
  onRefresh?: () => void
  showToast: (title: string, message: string, type: "success" | "error" | "warning") => void
}

export function ClassDetailDialog({ classItem, onClose, onRefresh, showToast }: ClassDetailDialogProps) {
  const [reports, setReports] = useState<any[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [schedules, setSchedules] = useState<any[]>([])
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)

  async function handleStatusChange(newStatus: string) {
    if (statusLoading) return
    const statusLabel = 
      newStatus === "active" ? "Đang học" :
      newStatus === "completed" ? "Hoàn thành" :
      newStatus === "cancelled" ? "Đã hủy" :
      newStatus === "suspended" ? "Tạm dừng" : newStatus;

    if (!confirm(`Bạn có chắc chắn muốn chuyển trạng thái lớp sang "${statusLabel}" không?`)) {
      return
    }

    setStatusLoading(true)
    try {
      await updateClassStatusForStaff(classItem.id, newStatus)
      showToast("Thành công", `Đã cập nhật trạng thái lớp học thành "${statusLabel}"!`, "success")
      if (onRefresh) onRefresh()
      onClose()
    } catch (err: any) {
      showToast("Thất bại", err.message || "Không thể cập nhật trạng thái lớp.", "error")
    } finally {
      setStatusLoading(false)
    }
  }

  useEffect(() => {
    async function loadData() {
      if (!classItem.id) return
      try {
        const [reportsData, schedulesData] = await Promise.all([
          getLearningReports(classItem.id),
          getClassScheduleForStaff(classItem.id)
        ])
        setReports(reportsData)
        setSchedules(schedulesData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingReports(false)
        setLoadingSchedules(false)
      }
    }
    loadData()
  }, [classItem.id])

  const [editingSchedule, setEditingSchedule] = useState<any | null>(null)
  const [isSavingSchedule, setIsSavingSchedule] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function refreshSchedules() {
    setLoadingSchedules(true)
    try {
      const data = await getClassScheduleForStaff(classItem.id)
      setSchedules(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingSchedules(false)
    }
  }

  async function handleSaveSchedule(e: React.FormEvent) {
    e.preventDefault()
    if (!editingSchedule) return
    setIsSavingSchedule(true)
    setErrorMessage(null)
    try {
      const payload = {
        dayOfWeek: editingSchedule.dayOfWeek,
        startTime: editingSchedule.startTime.length === 5 ? `${editingSchedule.startTime}:00` : editingSchedule.startTime,
        endTime: editingSchedule.endTime.length === 5 ? `${editingSchedule.endTime}:00` : editingSchedule.endTime,
        sessionDate: editingSchedule.sessionDate ? new Date(editingSchedule.sessionDate).toISOString().split('T')[0] : null,
        sessionStatus: editingSchedule.sessionStatus,
        note: editingSchedule.note || "",
      }
      if (editingSchedule.id) {
        await updateClassSchedule(classItem.id, editingSchedule.id, payload)
      } else {
        await createClassSchedule(classItem.id, payload)
      }
      setEditingSchedule(null)
      await refreshSchedules()
    } catch (err: any) {
      setErrorMessage(err.message || "Đã xảy ra lỗi khi lưu lịch học.")
    } finally {
      setIsSavingSchedule(false)
    }
  }

  async function handleDeleteSchedule(scheduleId: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa buổi học này không?")) return
    setIsSavingSchedule(true)
    setErrorMessage(null)
    try {
      await deleteClassSchedule(classItem.id, scheduleId)
      setEditingSchedule(null)
      await refreshSchedules()
    } catch (err: any) {
      setErrorMessage(err.message || "Đã xảy ra lỗi khi xóa lịch học.")
    } finally {
      setIsSavingSchedule(false)
    }
  }

  function getStatusConfig(status?: string) {
    switch (status) {
      case "completed":
        return {
          label: "Có mặt",
          bg: "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/70",
          indicator: "bg-emerald-500",
        }
      case "cancelled":
        return {
          label: "Nghỉ học",
          bg: "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100/70",
          indicator: "bg-rose-500",
        }
      case "rescheduled":
        return {
          label: "Học bù",
          bg: "bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100/70",
          indicator: "bg-sky-500",
        }
      case "scheduled":
      default:
        return {
          label: "Chưa học",
          bg: "bg-amber-50/70 text-amber-800 border border-amber-200 hover:bg-amber-100/70",
          indicator: "bg-amber-500",
        }
    }
  }

  const raw = classItem.raw
  const creationDate = raw?.request?.createdAt
    ? new Intl.DateTimeFormat("vi-VN").format(new Date(raw.request.createdAt))
    : "Chưa rõ"

  const daysOfWeek = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]
  const timeSlots = [
    { label: "Sáng (08:00 - 10:00)", start: "08:00", end: "10:00" },
    { label: "Sáng (10:00 - 12:00)", start: "10:00", end: "12:00" },
    { label: "Chiều (14:00 - 16:00)", start: "14:00", end: "16:00" },
    { label: "Chiều (16:00 - 18:00)", start: "16:00", end: "18:00" },
    { label: "Tối (17:30 - 19:30)", start: "17:30", end: "19:30" },
    { label: "Tối (19:00 - 21:00)", start: "19:00", end: "21:00" },
  ]

  function getSessionInSlot(day: string, slotStart: string, slotEnd: string) {
    return schedules.find((s) => {
      const sDay = s.dayOfWeek === "T2" ? "Thứ 2" : 
                    s.dayOfWeek === "T3" ? "Thứ 3" :
                    s.dayOfWeek === "T4" ? "Thứ 4" :
                    s.dayOfWeek === "T5" ? "Thứ 5" :
                    s.dayOfWeek === "T6" ? "Thứ 6" :
                    s.dayOfWeek === "T7" ? "Thứ 7" :
                    s.dayOfWeek === "CN" ? "Chủ nhật" : s.dayOfWeek

      if (sDay !== day) return false

      const sStart = s.startTime.slice(0, 5)
      const sEnd = s.endTime.slice(0, 5)
      return (sStart < slotEnd && sEnd > slotStart)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-7"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-xl shadow-xl flex flex-col max-h-[85vh]"
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
                  <Skeleton className="mt-1 h-4 w-20" />
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

          {/* Thời khóa biểu lớp học */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-400 uppercase tracking-wider">
                <Calendar size={13} className="text-slate-400 shrink-0" />
                <span>Thời khóa biểu lớp học</span>
              </div>
              <button
                type="button"
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                onClick={() => {
                  setEditingSchedule({
                    id: undefined,
                    dayOfWeek: "T2",
                    startTime: "08:00",
                    endTime: "10:00",
                    sessionDate: new Date().toISOString().slice(0, 10),
                    sessionStatus: "scheduled",
                    note: "",
                  })
                }}
              >
                + Thêm buổi học mới
              </button>
            </div>
            {loadingSchedules ? (
              <div className="rounded-lg border border-slate-100 bg-white p-2">
                <div className="mb-2 grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <Skeleton key={index} className="h-7 rounded" />
                  ))}
                </div>
                <div className="space-y-1.5">
                  {Array.from({ length: 3 }).map((_, row) => (
                    <div key={row} className="grid grid-cols-7 gap-1.5">
                      {Array.from({ length: 7 }).map((__, col) => (
                        <Skeleton key={col} className="h-10 rounded" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : schedules.length > 0 ? (
              <div className="overflow-x-auto border border-slate-150 rounded-lg">
                <table className="w-full border-collapse text-left text-xs min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="p-2.5 border-r border-slate-150 w-[140px]">Khung giờ</th>
                      {daysOfWeek.map((day) => (
                        <th key={day} className="p-2.5 text-center border-r last:border-r-0 border-slate-150">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot) => (
                      <tr key={slot.label} className="border-b last:border-b-0 border-slate-150 hover:bg-slate-50/30">
                        <td className="p-2.5 font-semibold text-slate-600 bg-slate-50/50 border-r border-slate-150">
                          {slot.label}
                        </td>
                        {daysOfWeek.map((day) => {
                          const session = getSessionInSlot(day, slot.start, slot.end)
                          const statusConf = session ? getStatusConfig(session.sessionStatus) : null
                          return (
                            <td 
                              key={day} 
                              className={`p-1.5 border-r last:border-r-0 border-slate-150 text-center transition-colors cursor-pointer ${
                                session 
                                  ? statusConf?.bg 
                                  : "bg-white hover:bg-slate-50 text-slate-300"
                              }`}
                              onClick={() => {
                                if (session) {
                                  setEditingSchedule({
                                    id: session.id,
                                    dayOfWeek: session.dayOfWeek,
                                    startTime: session.startTime.slice(0, 5),
                                    endTime: session.endTime.slice(0, 5),
                                    sessionDate: session.sessionDate ? session.sessionDate.toString().slice(0, 10) : "",
                                    sessionStatus: session.sessionStatus,
                                    note: session.note || "",
                                  })
                                } else {
                                  const dayMap: Record<string, string> = {
                                    "Thứ 2": "T2",
                                    "Thứ 3": "T3",
                                    "Thứ 4": "T4",
                                    "Thứ 5": "T5",
                                    "Thứ 6": "T6",
                                    "Thứ 7": "T7",
                                    "Chủ nhật": "CN",
                                  }
                                  setEditingSchedule({
                                    id: undefined,
                                    dayOfWeek: dayMap[day] || "T2",
                                    startTime: slot.start,
                                    endTime: slot.end,
                                    sessionDate: new Date().toISOString().slice(0, 10),
                                    sessionStatus: "scheduled",
                                    note: "Học bù",
                                  })
                                }
                              }}
                            >
                              {session ? (
                                <div className="flex flex-col items-center justify-center p-1 rounded border border-slate-200/50 bg-white shadow-xs max-w-[100px] mx-auto">
                                  <span className="font-bold text-[9px] truncate w-full" title={session.class.subject?.name}>
                                    {session.class.subject?.name}
                                  </span>
                                  <span className="text-[8px] font-bold text-slate-400 mt-0.5">
                                    {session.startTime.slice(0, 5)} - {session.endTime.slice(0, 5)}
                                  </span>
                                  <span className={`text-[8px] font-bold px-1 py-0.2 mt-1 rounded-sm flex items-center gap-0.5 ${statusConf?.bg}`}>
                                    <span className={`size-1 rounded-full ${statusConf?.indicator}`} />
                                    {statusConf?.label}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[9px] font-normal opacity-20">— Rảnh —</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5 border border-dashed border-slate-200 rounded-lg text-xs text-muted-foreground bg-slate-50/30">
                Chưa xếp lịch học cho lớp này.
              </div>
            )}
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

          {/* Báo cáo học tập từ gia sư */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-400 uppercase tracking-wider">
              <FileText size={13} className="text-slate-400 shrink-0" />
              <span>Báo cáo học tập ({reports.length})</span>
            </div>
            {loadingReports ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="rounded-lg border border-slate-200 bg-white p-3.5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="mb-2 h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-3/4" />
                  </div>
                ))}
              </div>
            ) : reports.length > 0 ? (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {reports.map((report: any, idx: number) => {
                  const progressLabels: Record<string, string> = {
                    excellent: 'Xuất sắc',
                    good: 'Tốt',
                    fair: 'Trung bình',
                    poor: 'Yếu',
                  }
                  const progressColors: Record<string, string> = {
                    excellent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    good: 'bg-blue-100 text-blue-700 border-blue-200',
                    fair: 'bg-amber-100 text-amber-700 border-amber-200',
                    poor: 'bg-red-100 text-red-700 border-red-200',
                  }
                  const rating = report.progressRating?.toLowerCase()
                  return (
                    <div
                      key={report.id || idx}
                      className="rounded-lg border border-slate-200 bg-white p-3.5 text-xs space-y-2.5 shadow-xs"
                    >
                      {/* Header: Ngày + Gia sư */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                            {report.tutor?.user?.fullName?.charAt(0)?.toUpperCase() || "G"}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-foreground block truncate">
                              {report.tutor?.user?.fullName || "Gia sư"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {report.reportDate
                                ? new Intl.DateTimeFormat("vi-VN", {
                                    dateStyle: "medium",
                                  }).format(new Date(report.reportDate))
                                : "—"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {rating && progressLabels[rating] && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${progressColors[rating] || 'bg-slate-100 text-slate-600'}`}>
                              {progressLabels[rating]}
                            </span>
                          )}
                          {report.attendanceStatus !== undefined && (
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                              report.attendanceStatus
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {report.attendanceStatus ? (
                                <><CheckCircle2 size={10} /> Có mặt</>
                              ) : (
                                <><XCircle size={10} /> Vắng</>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Nội dung báo cáo */}
                      {report.content && (
                        <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                          <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider block mb-1">Nội dung</span>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{report.content}</p>
                        </div>
                      )}

                      {/* Bài tập về nhà */}
                      {report.homework && (
                        <div className="bg-amber-50/50 rounded-lg p-2.5 border border-amber-100">
                          <span className="font-semibold text-amber-600 text-[10px] uppercase tracking-wider block mb-1">Bài tập về nhà</span>
                          <p className="text-amber-900 leading-relaxed whitespace-pre-wrap">{report.homework}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg text-xs text-muted-foreground bg-slate-50/30">
                <FileText size={16} className="mx-auto mb-1.5 text-slate-300" />
                Chưa có báo cáo học tập nào từ gia sư cho lớp này.
              </div>
            )}
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

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-border bg-slate-50 px-5 py-3 rounded-b-xl shrink-0">
          <div className="flex gap-2">
            {classItem.status !== "Đang học" && (
              <button
                type="button"
                onClick={() => handleStatusChange("active")}
                disabled={statusLoading}
                className="h-8 inline-flex items-center justify-center rounded bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-offset-1 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Mở lại lớp
              </button>
            )}
            {classItem.status === "Đang học" && (
              <button
                type="button"
                onClick={() => handleStatusChange("suspended")}
                disabled={statusLoading}
                className="h-8 inline-flex items-center justify-center rounded bg-amber-600 hover:bg-amber-700 text-white px-3.5 text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-offset-1 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Tạm đóng lớp
              </button>
            )}
            {classItem.status !== "Hoàn thành" && (
              <button
                type="button"
                onClick={() => handleStatusChange("completed")}
                disabled={statusLoading}
                className="h-8 inline-flex items-center justify-center rounded bg-blue-600 hover:bg-blue-700 text-white px-3.5 text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-offset-1 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Hoàn thành lớp
              </button>
            )}
            {classItem.status !== "Đã hủy" && (
              <button
                type="button"
                onClick={() => handleStatusChange("cancelled")}
                disabled={statusLoading}
                className="h-8 inline-flex items-center justify-center rounded bg-rose-600 hover:bg-rose-700 text-white px-3.5 text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-offset-1 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Hủy lớp
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 inline-flex items-center justify-center rounded border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>

        {/* Overlay Modal for Add/Edit Schedule */}
        {editingSchedule && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4">
            <div
              className="w-full max-w-sm bg-white rounded-xl shadow-xl flex flex-col p-5 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-foreground">
                  {editingSchedule.id ? "Chỉnh sửa buổi học" : "Thêm buổi học mới (Học bù)"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingSchedule(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>

              {errorMessage && (
                <div className="p-2 text-xs bg-red-50 border border-red-200 text-red-700 rounded">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Thứ trong tuần</label>
                  <select
                    value={editingSchedule.dayOfWeek}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, dayOfWeek: e.target.value })}
                    className="w-full border border-slate-200 rounded p-2 text-xs bg-white"
                    required
                  >
                    <option value="T2">Thứ 2</option>
                    <option value="T3">Thứ 3</option>
                    <option value="T4">Thứ 4</option>
                    <option value="T5">Thứ 5</option>
                    <option value="T6">Thứ 6</option>
                    <option value="T7">Thứ 7</option>
                    <option value="CN">Chủ nhật</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Giờ bắt đầu</label>
                    <input
                      type="time"
                      value={editingSchedule.startTime}
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, startTime: e.target.value })}
                      className="w-full border border-slate-200 rounded p-2 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Giờ kết thúc</label>
                    <input
                      type="time"
                      value={editingSchedule.endTime}
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, endTime: e.target.value })}
                      className="w-full border border-slate-200 rounded p-2 text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Ngày học (Tùy chọn)</label>
                  <input
                    type="date"
                    value={editingSchedule.sessionDate}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, sessionDate: e.target.value })}
                    className="w-full border border-slate-200 rounded p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Trạng thái (Điểm danh)</label>
                  <select
                    value={editingSchedule.sessionStatus}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, sessionStatus: e.target.value })}
                    className="w-full border border-slate-200 rounded p-2 text-xs font-semibold bg-white"
                    required
                  >
                    <option value="scheduled">Chưa học (Sắp tới)</option>
                    <option value="completed">Có mặt (Đã học)</option>
                    <option value="cancelled">Nghỉ học (Vắng / Hủy)</option>
                    <option value="rescheduled">Học bù (Đổi lịch)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Ghi chú</label>
                  <textarea
                    value={editingSchedule.note}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, note: e.target.value })}
                    placeholder="Ghi chú buổi học..."
                    className="w-full border border-slate-200 rounded p-2 text-xs h-16 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                {editingSchedule.id ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteSchedule(editingSchedule.id)}
                    disabled={isSavingSchedule}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded text-xs transition-colors"
                  >
                    Xóa buổi
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSchedule(null)}
                    disabled={isSavingSchedule}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-xs transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSchedule}
                    disabled={isSavingSchedule}
                    className="px-3 py-1.5 bg-primary hover:bg-primary/95 text-white font-bold rounded text-xs transition-colors"
                  >
                    {isSavingSchedule ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

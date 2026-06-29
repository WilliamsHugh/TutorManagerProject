"use client"

import { useEffect, useState, useMemo } from "react"
import { X, Mail, Phone, MapPin, UserRound, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/common/Skeleton"
import { getClasses, getStudentScheduleForStaff, toggleUserStatusForStaff, deleteUserForStaff } from "@/lib/api"

export interface StudentData {
  id: string
  gradeLevel: string
  schoolName: string
  parentName: string
  parentPhone: string
  parentEmail: string
  user: {
    id: string
    fullName: string
    email: string
    phone: string
    address: string
    avatarUrl: string
    isActive: boolean
    createdAt: string
  }
}

type StudentProfileDialogProps = {
  student: StudentData
  onClose: () => void
  onRefresh: () => void
  showToast: (title: string, message: string, type: "success" | "error" | "warning") => void
}

export function StudentProfileDialog({ student, onClose, onRefresh, showToast }: StudentProfileDialogProps) {
  const [classes, setClasses] = useState<any[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [schedules, setSchedules] = useState<any[]>([])
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const handleToggleStatus = async () => {
    if (actionLoading) return
    const confirmMsg = student.user?.isActive 
      ? `Bạn có chắc chắn muốn tạm khóa học viên "${student.user.fullName}"?`
      : `Bạn có chắc chắn muốn mở khóa học viên "${student.user.fullName}"?`
    if (!window.confirm(confirmMsg)) return

    setActionLoading(true)
    try {
      await toggleUserStatusForStaff(student.user.id, !student.user.isActive)
      showToast(
        "Thành công",
        student.user?.isActive ? "Đã tạm khóa tài khoản học viên." : "Đã mở khóa tài khoản học viên.",
        "success"
      )
      onRefresh()
      onClose()
    } catch (err) {
      showToast(
        "Thất bại",
        err instanceof Error ? err.message : "Thao tác thất bại.",
        "error"
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteStudent = async () => {
    if (actionLoading) return
    if (!window.confirm(`HÀNH ĐỘNG NÀY KHÔNG THỂ KHÔI PHỤC!\nBạn có chắc chắn muốn xóa vĩnh viễn học viên "${student.user?.fullName}" cùng các hồ sơ liên quan?`)) {
      return
    }

    setActionLoading(true)
    try {
      await deleteUserForStaff(student.user.id)
      showToast("Thành công", "Đã xóa vĩnh viễn học viên và hồ sơ liên quan.", "success")
      onRefresh()
      onClose()
    } catch (err) {
      showToast(
        "Thất bại",
        err instanceof Error ? err.message : "Thao tác thất bại.",
        "error"
      )
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    async function loadStudentClasses() {
      try {
        const all = await getClasses()
        const filtered = all.filter((cls: any) => cls.student?.id === student.id)
        setClasses(filtered)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingClasses(false)
      }
    }
    loadStudentClasses()
  }, [student.id])

  useEffect(() => {
    async function loadSchedule() {
      if (!showSchedule) return
      setLoadingSchedule(true)
      try {
        const data = await getStudentScheduleForStaff(student.id)
        setSchedules(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingSchedule(false)
      }
    }
    loadSchedule()
  }, [student.id, showSchedule])

  // Local state for week navigation (start of week)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    const monday = new Date(d.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    return monday
  })

  // Format week range text
  const weekRangeText = useMemo(() => {
    const end = new Date(currentWeekStart)
    end.setDate(end.getDate() + 6)
    const fmt = (date: Date) => {
      const dd = String(date.getDate()).padStart(2, '0')
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const yyyy = date.getFullYear()
      return `${dd}/${mm}/${yyyy}`
    }
    return `Tuần từ ${fmt(currentWeekStart)} đến ${fmt(end)}`
  }, [currentWeekStart])

  // Get specific date strings for headers
  const headerDays = useMemo(() => {
    const days = []
    const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart)
      d.setDate(d.getDate() + i)
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      days.push({
        name: dayNames[i],
        dateStr: `${dd}/${mm}`
      })
    }
    return days
  }, [currentWeekStart])

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart)
    prev.setDate(prev.getDate() - 7)
    setCurrentWeekStart(prev)
  }

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart)
    next.setDate(next.getDate() + 7)
    setCurrentWeekStart(next)
  }

  const timeSlots = [
    { label: "08:00 - 10:00", start: "08:00", end: "10:00" },
    { label: "10:00 - 12:00", start: "10:00", end: "12:00" },
    { label: "14:00 - 16:00", start: "14:00", end: "16:00" },
    { label: "16:00 - 18:00", start: "16:00", end: "18:00" },
    { label: "17:30 - 19:30", start: "17:30", end: "19:30" },
    { label: "19:00 - 21:00", start: "19:00", end: "21:00" },
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

      const sStart = s.startTime.slice(0, 5)
      const sEnd = s.endTime.slice(0, 5)
      const timeMatch = (sStart < slotEnd && sEnd > slotStart)
      if (!timeMatch) return false

      const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]
      const dayIndex = dayNames.indexOf(day)
      if (dayIndex === -1) return false

      const slotDate = new Date(currentWeekStart)
      slotDate.setDate(slotDate.getDate() + dayIndex)
      slotDate.setHours(12, 0, 0, 0)

      if (s.sessionDate) {
        const sDate = new Date(s.sessionDate)
        return (
          sDate.getFullYear() === slotDate.getFullYear() &&
          sDate.getMonth() === slotDate.getMonth() &&
          sDate.getDate() === slotDate.getDate()
        )
      } else {
        if (sDay !== day) return false
        if (s.class) {
          const clsStart = s.class.startDate ? new Date(s.class.startDate) : null
          const clsEnd = s.class.endDate ? new Date(s.class.endDate) : null

          if (clsStart) {
            clsStart.setHours(0, 0, 0, 0)
            if (slotDate < clsStart) return false
          }
          if (clsEnd) {
            clsEnd.setHours(23, 59, 59, 999)
            if (slotDate > clsEnd) return false
          }
        }
      }

      return true
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-7"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-base font-bold">Hồ sơ chi tiết Học viên</h2>
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
          {/* Avatar and name */}
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            {student.user?.avatarUrl ? (
              <img
                src={student.user.avatarUrl}
                alt={student.user.fullName}
                className="size-14 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-extrabold text-xl">
                {student.user?.fullName?.charAt(0)?.toUpperCase() || "H"}
              </div>
            )}
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">{student.user?.fullName || "Chưa cập nhật"}</h3>
              <div>
                <Badge className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${student.user?.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                  {student.user?.isActive ? "Đang hoạt động" : "Đã khóa"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Thông tin cá nhân</h4>
            <div className="grid gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500 w-16">Email:</span>
                <span className="text-foreground">{student.user?.email || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500 w-16">SĐT:</span>
                <span className="text-foreground">{student.user?.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500 w-16">Địa chỉ:</span>
                <span className="text-foreground">{student.user?.address || "—"}</span>
              </div>
            </div>
          </div>

          {/* Academic Details */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Học tập</h4>
            <div className="grid gap-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-muted-foreground font-medium">Lớp</span>
                <span className="font-bold text-foreground">{student.gradeLevel || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-muted-foreground font-medium">Trường học</span>
                <span className="font-semibold text-foreground">{student.schoolName || "—"}</span>
              </div>
            </div>
          </div>

          {/* Parent Details */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Thông tin phụ huynh</h4>
            <div className="grid gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <UserRound size={13} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500 w-24">Họ tên PH:</span>
                <span className="text-foreground font-medium">{student.parentName || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500 w-24">SĐT PH:</span>
                <span className="text-foreground">{student.parentPhone || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500 w-24">Email PH:</span>
                <span className="text-foreground">{student.parentEmail || "—"}</span>
              </div>
            </div>
          </div>

          {/* Classes list */}
          <div className="space-y-4">
            {loadingClasses ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-16 rounded" />
                    </div>
                    <Skeleton className="h-3.5 w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Active classes */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Lớp đang học ({classes.filter(c => c.status === "active" || c.status === "suspended").length})</h4>
                  {classes.filter(c => c.status === "active" || c.status === "suspended").length > 0 ? (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {classes.filter(c => c.status === "active" || c.status === "suspended").map((cls) => {
                        const statusLabel = cls.status === "active" ? "Đang học" : "Tạm dừng";
                        const statusClass = cls.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200";
                        return (
                          <div key={cls.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between gap-3 text-xs">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">
                                  {cls.subject?.name || "Chưa chọn môn"}
                                </span>
                                <span className={`inline-block border rounded px-1.5 py-0.5 text-[10px] font-semibold ${statusClass}`}>
                                  {statusLabel}
                                </span>
                              </div>
                              <div className="text-muted-foreground flex items-center gap-1.5">
                                <span>Gia sư: {cls.tutor?.user?.fullName || "—"}</span>
                                <span>·</span>
                                <span>Học phí: {Number(cls.feePerSession).toLocaleString("vi-VN")}đ/buổi</span>
                              </div>
                            </div>
                            {cls.startDate && (
                              <div className="text-[10px] text-muted-foreground text-right shrink-0">
                                Bắt đầu: {new Intl.DateTimeFormat("vi-VN").format(new Date(cls.startDate))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic bg-slate-50 p-2.5 rounded-lg border border-dashed border-border text-center">
                      Không có lớp nào đang học.
                    </div>
                  )}
                </div>

                {/* Past classes */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Lớp đã học ({classes.filter(c => c.status === "completed" || c.status === "cancelled").length})</h4>
                  {classes.filter(c => c.status === "completed" || c.status === "cancelled").length > 0 ? (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {classes.filter(c => c.status === "completed" || c.status === "cancelled").map((cls) => {
                        const statusLabel = cls.status === "completed" ? "Hoàn thành" : "Đã hủy";
                        const statusClass = cls.status === "completed" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-700 border-slate-200";
                        return (
                          <div key={cls.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between gap-3 text-xs">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">
                                  {cls.subject?.name || "Chưa chọn môn"}
                                </span>
                                <span className={`inline-block border rounded px-1.5 py-0.5 text-[10px] font-semibold ${statusClass}`}>
                                  {statusLabel}
                                </span>
                              </div>
                              <div className="text-muted-foreground flex items-center gap-1.5">
                                <span>Gia sư: {cls.tutor?.user?.fullName || "—"}</span>
                                <span>·</span>
                                <span>Học phí: {Number(cls.feePerSession).toLocaleString("vi-VN")}đ/buổi</span>
                              </div>
                            </div>
                            {cls.endDate && (
                              <div className="text-[10px] text-muted-foreground text-right shrink-0">
                                Kết thúc: {new Intl.DateTimeFormat("vi-VN").format(new Date(cls.endDate))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic bg-slate-50 p-2.5 rounded-lg border border-dashed border-border text-center">
                      Chưa có lịch sử lớp đã học.
                    </div>
                  )}
                </div>
              </>
            )}
            {/* Lịch học / Lịch bận */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-between font-bold text-xs text-slate-400 hover:text-slate-600 uppercase tracking-wider transition-colors"
                onClick={() => setShowSchedule(!showSchedule)}
              >
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400 shrink-0" />
                  Thời khóa biểu & Lịch học bận
                </span>
                <span>{showSchedule ? "▲ Thu gọn" : "▼ Mở rộng"}</span>
              </button>

              {showSchedule && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-3 mb-2 text-xs font-semibold bg-slate-50 p-2 rounded border border-slate-200">
                    <button
                      onClick={handlePrevWeek}
                      className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:bg-slate-50 transition-colors text-[10px]"
                    >
                      &larr; Tuần trước
                    </button>
                    <span className="text-slate-700 font-bold text-[10px]">{weekRangeText}</span>
                    <button
                      onClick={handleNextWeek}
                      className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:bg-slate-50 transition-colors text-[10px]"
                    >
                      Tuần sau &rarr;
                    </button>
                  </div>

                  {loadingSchedule ? (
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
                    <div className="overflow-x-auto border border-slate-150 rounded-lg bg-white">
                      <table className="w-full border-collapse text-left text-[11px] min-w-[550px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150 text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                            <th className="p-2 border-r border-slate-150 w-[90px]">Khung giờ</th>
                            {headerDays.map((day) => (
                              <th key={day.name} className="p-2 text-center border-r last:border-r-0 border-slate-150">
                                {day.name}
                                <span className="block text-[8px] font-medium text-slate-400 mt-0.5">({day.dateStr})</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {timeSlots.map((slot) => (
                            <tr key={slot.label} className="border-b last:border-b-0 border-slate-150 hover:bg-slate-50/30">
                              <td className="p-2 font-semibold text-slate-600 bg-slate-50/50 border-r border-slate-150 text-[9px]">
                                {slot.label}
                              </td>
                              {headerDays.map((day) => {
                                const session = getSessionInSlot(day.name, slot.start, slot.end)
                                return (
                                  <td 
                                    key={day.name} 
                                    className={`p-1 border-r last:border-r-0 border-slate-150 text-center transition-colors ${
                                      session 
                                        ? "bg-amber-50 text-amber-900" 
                                        : "bg-white text-slate-300"
                                    }`}
                                  >
                                    {session ? (
                                      <div className="flex flex-col items-center justify-center p-0.5 rounded border border-amber-200 bg-white shadow-xs max-w-[85px] mx-auto text-[8px]">
                                        <span className="font-bold text-amber-800 truncate w-full" title={session.class.subject?.name}>
                                          {session.class.subject?.name}
                                        </span>
                                        <span className="text-[7px] text-slate-400 truncate w-full">
                                          GS: {session.class.tutor?.user?.fullName || "Ẩn danh"}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-[9px] font-normal opacity-10">—</span>
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
                    <div className="text-center py-5 border border-dashed border-slate-200 rounded-lg text-slate-500 bg-slate-50/30">
                      Chưa có lịch học bận nào (Không có lớp học hoạt động).
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-border bg-slate-50 px-5 py-3 rounded-b-xl shrink-0">
          <div className="flex gap-2">
            <button
              onClick={handleToggleStatus}
              disabled={actionLoading}
              className={`h-8 inline-flex items-center justify-center gap-1.5 rounded px-3.5 text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-offset-1 active:scale-95 disabled:opacity-50 cursor-pointer ${
                student.user?.isActive
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {student.user?.isActive ? "Tạm khóa" : "Mở khóa"}
            </button>
            <button
              onClick={handleDeleteStudent}
              disabled={actionLoading}
              className="h-8 inline-flex items-center justify-center gap-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white px-3.5 text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-offset-1 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Xóa học viên
            </button>
          </div>
          <button
            onClick={onClose}
            className="h-8 inline-flex items-center justify-center rounded border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

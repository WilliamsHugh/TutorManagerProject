"use client"

import { ChevronDown, X, Calendar } from "lucide-react"
import { useState, useMemo, useEffect } from "react"

import { Button } from "@/components/ui/button"

import { RequestContactCard } from "./RequestContactCard"
import { RequestDetailCard } from "./RequestDetailCard"
import { TutorRecommendationCard } from "./TutorRecommendationCard"
import { getTutorScheduleForStaff, getStudentScheduleForStaff } from "@/lib/api"
import type { RequestItem, RequestStatus, TutorRecommendation } from "@/types/class_request"

const statusOptions: RequestStatus[] = ["Chờ xử lý", "Đang xử lý", "Đã ghép", "Đã hủy"]

type MatchTutorDialogProps = {
  request: RequestItem
  tutors: TutorRecommendation[]
  loadingTutors?: boolean
  onRefreshTutors?: () => void
  onStatusChange?: (status: RequestStatus) => Promise<void>
  onClose: () => void
}

export function MatchTutorDialog({
  request,
  tutors,
  loadingTutors = false,
  onRefreshTutors,
  onStatusChange,
  onClose,
}: MatchTutorDialogProps) {
  const [status, setStatus] = useState<RequestStatus>(request.status)
  const [savingStatus, setSavingStatus] = useState(false)

  // Schedule View Modal State
  const [activeScheduleModal, setActiveScheduleModal] = useState<{ id: string; name: string; role: "tutor" | "student" } | null>(null)

  // Filtering States
  const [approvedOnly, setApprovedOnly] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState(request.subject)
  const [selectedArea, setSelectedArea] = useState(request.area)
  const [matchSchedule, setMatchSchedule] = useState(true)

  // Dropdown UI States
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showApprovedDropdown, setShowApprovedDropdown] = useState(false)
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)
  const [showAreaDropdown, setShowAreaDropdown] = useState(false)

  async function handleStatusChange(value: RequestStatus) {
    setStatus(value)
    setShowStatusDropdown(false)
    if (!onStatusChange) return

    setSavingStatus(true)
    try {
      await onStatusChange(value)
    } finally {
      setSavingStatus(false)
    }
  }

  // Dynamically extract available subjects from tutor list
  const availableSubjects = useMemo(() => {
    const subs = new Set<string>()
    if (request.subject) subs.add(request.subject)
    tutors.forEach(t => {
      if (t.tags[0]) subs.add(t.tags[0])
    })
    return Array.from(subs)
  }, [tutors, request.subject])

  // Dynamically extract available areas from tutor list
  const availableAreas = useMemo(() => {
    const areas = new Set<string>()
    if (request.area) areas.add(request.area)
    tutors.forEach(t => {
      t.tags.forEach(tag => {
        if (
          tag !== t.tags[0] &&
          tag !== t.tags[1] &&
          tag !== "Khớp khu vực" &&
          tag !== "Cần kiểm tra khu vực" &&
          tutorStatusLabel(t.status) !== tag
        ) {
          tag.split(",").map(s => s.trim()).forEach(a => {
            if (a) areas.add(a)
          })
        }
      })
    })
    return Array.from(areas)
  }, [tutors, request.area])

  function tutorStatusLabel(status: string) {
    return status === "Hồ sơ đã duyệt" ? "Hồ sơ đã duyệt" : "Cần kiểm tra hồ sơ"
  }

  // Filter and Sort Tutors
  const filteredTutors = useMemo(() => {
    let result = tutors.filter((tutor) => {
      // 1. Approval status filter
      if (approvedOnly && tutor.status !== "Hồ sơ đã duyệt") {
        return false
      }

      // 2. Subject filter
      if (selectedSubject && selectedSubject !== "Tất cả") {
        const matchesSubject = tutor.tags.some(tag => 
          tag.toLowerCase().includes(selectedSubject.toLowerCase())
        )
        if (!matchesSubject) return false
      }

      // 3. Area filter
      if (selectedArea && selectedArea !== "Tất cả") {
        const targetArea = selectedArea.trim().toLowerCase()
        const areaTag = tutor.tags[2] || ""
        const tutorAreas = areaTag.split(",").map(s => s.trim().toLowerCase())
        const matchesArea = tutorAreas.some(area => 
          area === targetArea || area === "toàn quốc" || area === "online"
        )
        if (!matchesArea) return false
      }

      return true
    })

    // 4. Schedule matching checkbox effect: Sort matching scores higher if prioritized
    if (matchSchedule) {
      result = [...result].sort((a, b) => {
        const scoreA = parseInt(a.match) || 0
        const scoreB = parseInt(b.match) || 0
        return scoreB - scoreA
      })
    }

    return result
  }, [tutors, approvedOnly, selectedSubject, selectedArea, matchSchedule])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-7"
      onClick={onClose}
    >
      <section
        aria-modal="true"
        className="max-h-[85vh] w-full max-w-170 rounded-md bg-white shadow-xl flex flex-col"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-border bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold">
                Đề xuất gia sư cho Yêu cầu {request.id} | {request.subject} -{" "}
                {request.level}
              </h2>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Tập trung vào việc tìm và ghép gia sư phù hợp theo môn học, khu
                vực và lịch rảnh.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className={`relative ${showStatusDropdown ? "z-30" : ""}`}>
                <Button
                  className="h-8 rounded text-xs gap-1.5"
                  variant="outline"
                  disabled={savingStatus || request.status === "Đã ghép" || request.status === "Đã hủy"}
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown)
                    setShowApprovedDropdown(false)
                    setShowSubjectDropdown(false)
                    setShowAreaDropdown(false)
                  }}
                >
                  {status}
                  <ChevronDown size={12} />
                </Button>
                {showStatusDropdown && (
                  <div className="absolute right-0 top-full mt-1 z-20 w-32 rounded-md border border-border bg-white p-1 shadow-md text-xs flex flex-col">
                    {statusOptions.map((option) => (
                      <button
                        key={option}
                        className={`w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded transition-colors ${status === option ? "font-bold text-primary" : ""}`}
                        onClick={() => handleStatusChange(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                aria-label="Đóng"
                className="flex size-8 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                type="button"
                onClick={onClose}
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col space-y-3 p-5 overflow-hidden">
          {(status === "Đã ghép" || status === "Đã hủy") && (
            <div className={`rounded-lg p-3.5 text-xs font-semibold border ${
              status === "Đã ghép" 
                ? "bg-green-50 text-green-700 border-green-200" 
                : "bg-slate-50 text-slate-700 border-slate-200"
            }`}>
              {status === "Đã ghép" 
                ? "✓ Yêu cầu này đã được ghép lớp thành công. Không thể ghép thêm gia sư khác."
                : "✕ Yêu cầu này đã bị hủy. Không thể thực hiện ghép gia sư."}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <RequestContactCard 
              request={request} 
              onViewSchedule={request.studentId ? () => setActiveScheduleModal({ id: request.studentId!, name: request.name, role: "student" }) : undefined}
            />
            <RequestDetailCard request={request} />
          </div>

          <div className="rounded border border-border p-3 flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-xs font-bold">Gia sư được đề xuất</h3>
              <Button
                className="h-7 rounded text-[11px] px-2.5"
                type="button"
                variant="outline"
                onClick={onRefreshTutors}
              >
                Làm mới gợi ý
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
                {/* Status Dropdown */}
                <div className={`relative ${showApprovedDropdown ? "z-30" : ""}`}>
                  <Button
                    className="h-7 rounded text-[11px] gap-1.5"
                    variant="outline"
                    onClick={() => {
                      setShowApprovedDropdown(!showApprovedDropdown)
                      setShowSubjectDropdown(false)
                      setShowAreaDropdown(false)
                    }}
                  >
                    {approvedOnly ? "Đã duyệt" : "Tất cả hồ sơ"}
                    <ChevronDown size={11} />
                  </Button>
                  {showApprovedDropdown && (
                    <div className="absolute left-0 top-full mt-1 z-20 w-32 rounded-md border border-border bg-white p-1 shadow-md text-[11px] flex flex-col">
                      <button
                        className={`w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded transition-colors ${approvedOnly ? "font-bold text-primary" : ""}`}
                        onClick={() => { setApprovedOnly(true); setShowApprovedDropdown(false); }}
                      >
                        Đã duyệt
                      </button>
                      <button
                        className={`w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded transition-colors ${!approvedOnly ? "font-bold text-primary" : ""}`}
                        onClick={() => { setApprovedOnly(false); setShowApprovedDropdown(false); }}
                      >
                        Tất cả hồ sơ
                      </button>
                    </div>
                  )}
                </div>

                {/* Subject Dropdown */}
                <div className={`relative ${showSubjectDropdown ? "z-30" : ""}`}>
                  <Button
                    className="h-7 rounded text-[11px] gap-1.5"
                    variant="outline"
                    onClick={() => {
                      setShowSubjectDropdown(!showSubjectDropdown)
                      setShowApprovedDropdown(false)
                      setShowAreaDropdown(false)
                    }}
                  >
                    {selectedSubject}
                    <ChevronDown size={11} />
                  </Button>
                  {showSubjectDropdown && (
                    <div className="absolute left-0 top-full mt-1 z-20 w-40 rounded-md border border-border bg-white p-1 shadow-md text-[11px] flex flex-col max-h-48 overflow-y-auto">
                      <button
                        className={`w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded transition-colors ${selectedSubject === "Tất cả" ? "font-bold text-primary" : ""}`}
                        onClick={() => { setSelectedSubject("Tất cả"); setShowSubjectDropdown(false); }}
                      >
                        Tất cả môn
                      </button>
                      {availableSubjects.map((sub) => (
                        <button
                          key={sub}
                          className={`w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded transition-colors ${selectedSubject === sub ? "font-bold text-primary" : ""}`}
                          onClick={() => { setSelectedSubject(sub); setShowSubjectDropdown(false); }}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Area Dropdown */}
                <div className={`relative ${showAreaDropdown ? "z-30" : ""}`}>
                  <Button
                    className="h-7 rounded text-[11px] gap-1.5"
                    variant="outline"
                    onClick={() => {
                      setShowAreaDropdown(!showAreaDropdown)
                      setShowApprovedDropdown(false)
                      setShowSubjectDropdown(false)
                    }}
                  >
                    {selectedArea}
                    <ChevronDown size={11} />
                  </Button>
                  {showAreaDropdown && (
                    <div className="absolute left-0 top-full mt-1 z-20 w-40 rounded-md border border-border bg-white p-1 shadow-md text-[11px] flex flex-col max-h-48 overflow-y-auto">
                      <button
                        className={`w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded transition-colors ${selectedArea === "Tất cả" ? "font-bold text-primary" : ""}`}
                        onClick={() => { setSelectedArea("Tất cả"); setShowAreaDropdown(false); }}
                      >
                        Tất cả khu vực
                      </button>
                      {availableAreas.map((area) => (
                        <button
                          key={area}
                          className={`w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded transition-colors ${selectedArea === area ? "font-bold text-primary" : ""}`}
                          onClick={() => { setSelectedArea(area); setShowAreaDropdown(false); }}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <label className="flex h-7 items-center gap-2 rounded border border-border px-2 text-[11px] font-semibold cursor-pointer select-none hover:bg-slate-50">
                  <input
                    className="size-3 accent-primary cursor-pointer"
                    checked={matchSchedule}
                    onChange={(e) => setMatchSchedule(e.target.checked)}
                    type="checkbox"
                  />
                  Ưu tiên khớp lịch rảnh
                </label>
              </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2 overflow-y-auto flex-1 min-h-0 pr-1.5 py-0.5">
              {loadingTutors ? (
                <>
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="rounded border border-border bg-white p-3 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 gap-3 w-full">
                          <div className="size-9 shrink-0 rounded-full bg-muted animate-pulse" />
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="h-5 w-14 bg-muted rounded animate-pulse shrink-0" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-14 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-3.5 w-16 bg-muted rounded animate-pulse" />
                        <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </>
              ) : filteredTutors.length ? (
                filteredTutors.map((tutor) => {
                  const isMatched = status === "Đã ghép"
                  const isCancelled = status === "Đã hủy"
                  const actionLabel = isMatched ? "Đã ghép" : isCancelled ? "Bị hủy" : "Ghép lớp"
                  const href = (isMatched || isCancelled)
                    ? undefined
                    : `/staff/request-management/create-class?requestId=${encodeURIComponent(
                        request.rawId
                      )}&tutorId=${encodeURIComponent(tutor.rawTutorId)}&tutorName=${encodeURIComponent(
                        tutor.name
                      )}`
                  return (
                    <TutorRecommendationCard
                      key={tutor.rawTutorId}
                      actionLabel={actionLabel}
                      href={href}
                      tutor={tutor}
                      onViewSchedule={() => setActiveScheduleModal({ id: tutor.rawTutorId, name: tutor.name, role: "tutor" })}
                    />
                  )
                })
              ) : (
                <div className="col-span-full rounded border border-dashed border-border p-4 text-xs text-muted-foreground">
                  Chưa có gia sư phù hợp theo dữ liệu hiện tại.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sub-modal: Schedule View */}
      {activeScheduleModal && (
        <ScheduleViewDialog 
          id={activeScheduleModal.id}
          name={activeScheduleModal.name}
          role={activeScheduleModal.role}
          onClose={() => setActiveScheduleModal(null)}
        />
      )}
    </div>
  )
}

type ScheduleViewDialogProps = {
  id: string
  name: string
  role: "tutor" | "student"
  onClose: () => void
}

function ScheduleViewDialog({ id, name, role, onClose }: ScheduleViewDialogProps) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    async function loadSchedule() {
      try {
        const data = role === "tutor" 
          ? await getTutorScheduleForStaff(id)
          : await getStudentScheduleForStaff(id)
        setSchedules(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadSchedule()
  }, [id, role])

  const daysOfWeek = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]
  const timeSlots = [
    { label: "Sáng (08:00 - 10:00)", start: "08:00", end: "10:00" },
    { label: "Sáng (10:00 - 12:00)", start: "10:00", end: "12:00" },
    { label: "Chiều (14:00 - 16:00)", start: "14:00", end: "16:00" },
    { label: "Chiều (16:00 - 18:00)", start: "16:00", end: "18:00" },
    { label: "Tối (17:30 - 19:30)", start: "17:30", end: "19:30" },
    { label: "Tối (19:00 - 21:00)", start: "19:00", end: "21:00" },
  ]

  // Check if a schedule overlaps with a slot on a given day
  function getSessionInSlot(day: string, slotStart: string, slotEnd: string) {
    return schedules.find((s) => {
      // Normalize day naming e.g. "T2" -> "Thứ 2"
      const sDay = s.dayOfWeek === "T2" ? "Thứ 2" : 
                    s.dayOfWeek === "T3" ? "Thứ 3" :
                    s.dayOfWeek === "T4" ? "Thứ 4" :
                    s.dayOfWeek === "T5" ? "Thứ 5" :
                    s.dayOfWeek === "T6" ? "Thứ 6" :
                    s.dayOfWeek === "T7" ? "Thứ 7" :
                    s.dayOfWeek === "CN" ? "Chủ nhật" : s.dayOfWeek

      if (sDay !== day) return false

      // Check overlap
      const sStart = s.startTime.slice(0, 5)
      const sEnd = s.endTime.slice(0, 5)
      return (sStart < slotEnd && sEnd > slotStart)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={onClose}>
      <div 
        className={`w-full ${viewMode === "grid" ? "max-w-4xl" : "max-w-md"} bg-white rounded-xl shadow-xl flex flex-col max-h-[85vh] transition-all duration-300`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              Lịch học & giảng dạy bận của {role === "tutor" ? "Gia sư" : "Học viên"}: <span className="text-primary">{name}</span>
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded border border-slate-200 p-0.5 bg-white text-[11px] font-semibold">
              <button 
                className={`px-2 py-0.5 rounded transition-colors ${viewMode === "grid" ? "bg-primary text-white" : "text-slate-500 hover:text-slate-800"}`}
                onClick={() => setViewMode("grid")}
              >
                Thời khóa biểu
              </button>
              <button 
                className={`px-2 py-0.5 rounded transition-colors ${viewMode === "list" ? "bg-primary text-white" : "text-slate-500 hover:text-slate-800"}`}
                onClick={() => setViewMode("list")}
              >
                Danh sách
              </button>
            </div>
            <button
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted"
              type="button"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-5 flex-1 min-h-0">
          {loading ? (
            <div className="space-y-3 py-6">
              <div className="h-5 w-full bg-slate-100 rounded animate-pulse" />
              <div className="h-20 w-full bg-slate-50 border border-slate-100 rounded animate-pulse" />
              <div className="h-20 w-full bg-slate-50 border border-slate-100 rounded animate-pulse" />
            </div>
          ) : schedules.length > 0 ? (
            viewMode === "grid" ? (
              <div className="overflow-x-auto border border-slate-150 rounded-lg">
                <table className="w-full border-collapse text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="p-3 border-r border-slate-150 w-[160px]">Khung giờ</th>
                      {daysOfWeek.map((day) => (
                        <th key={day} className="p-3 text-center border-r last:border-r-0 border-slate-150">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot) => (
                      <tr key={slot.label} className="border-b last:border-b-0 border-slate-150 hover:bg-slate-50/30">
                        <td className="p-3 font-semibold text-slate-600 bg-slate-50/50 border-r border-slate-150">
                          {slot.label}
                        </td>
                        {daysOfWeek.map((day) => {
                          const session = getSessionInSlot(day, slot.start, slot.end)
                          return (
                            <td 
                              key={day} 
                              className={`p-2 border-r last:border-r-0 border-slate-150 text-center transition-colors ${
                                session 
                                  ? "bg-amber-50/80 text-amber-900" 
                                  : "bg-white text-slate-300"
                              }`}
                            >
                              {session ? (
                                <div className="flex flex-col items-center justify-center p-1 rounded border border-amber-200 bg-white shadow-xs max-w-[110px] mx-auto">
                                  <span className="font-bold text-[10px] text-amber-800 truncate w-full" title={session.class.subject?.name}>
                                    {session.class.subject?.name}
                                  </span>
                                  <span className="text-[8px] font-bold text-slate-400 mt-0.5">
                                    CLASS-{session.class.id.replace(/-/g, '').slice(0, 4).toUpperCase()}
                                  </span>
                                  <span className="text-[8px] text-slate-500 truncate w-full mt-0.5 font-medium">
                                    {role === "tutor" 
                                      ? session.class.student?.user?.fullName 
                                      : session.class.tutor?.user?.fullName}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] font-medium opacity-20">— Rảnh —</span>
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
              <div className="space-y-2.5 max-w-md mx-auto">
                <p className="text-[11px] text-muted-foreground mb-3">
                  Danh sách các buổi học của lớp đang hoạt động (ACTIVE):
                </p>
                {schedules.map((s, idx) => {
                  const classCode = `CLASS-${s.class.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`
                  const classSubject = s.class.subject?.name || "Môn học"
                  const classPartner = role === "tutor"
                    ? `Học viên: ${s.class.student?.user?.fullName || "Ẩn danh"}`
                    : `Gia sư: ${s.class.tutor?.user?.fullName || "Ẩn danh"}`

                  return (
                    <div key={idx} className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">{s.dayOfWeek}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                          {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-800 mt-1">
                        {classSubject} ({classCode})
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {classPartner}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Không có lịch bận nào (Chưa có lớp học đang diễn ra).
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


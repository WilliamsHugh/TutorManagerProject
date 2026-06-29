"use client"

import { ChevronDown, X, Calendar } from "lucide-react"
import { useState, useMemo, useEffect } from "react"

import { Button } from "@/components/ui/button"

import { RequestContactCard } from "./RequestContactCard"
import { RequestDetailCard } from "./RequestDetailCard"
import { TutorRecommendationCard } from "./TutorRecommendationCard"
import { getTutorScheduleForStaff, getStudentScheduleForStaff } from "@/lib/api"
import type { RequestItem, RequestStatus, TutorRecommendation } from "@/types/class_request"
import { TutorDetailModal } from "../../../(portal)/student/_components/TutorDetailModal"

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

  // Tutor Detail Modal State
  const [selectedTutorForDetail, setSelectedTutorForDetail] = useState<any | null>(null)

  const handleOpenTutorDetail = (tutor: TutorRecommendation) => {
    const mapped: any = {
      id: tutor.id,
      name: tutor.name,
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      match: parseInt(tutor.match) || 95,
      experience: tutor.meta.split(" · ")[0] || "Chưa cập nhật",
      education: tutor.meta.split(" · ")[1] || "Chưa cập nhật",
      location: tutor.tags[2] || "Toàn quốc",
      price: "Thỏa thuận",
      rating: 5,
      reviews: 0,
      teachingMode: "Linh hoạt",
      availableTime: "Linh hoạt",
      phone: tutor.phone || "",
      email: tutor.email || "",
      bio: "Đang tải giới thiệu chi tiết...",
      tags: tutor.tags,
    }
    
    setSelectedTutorForDetail(mapped)

    // Fetch actual details to populate extra fields like bio and avatar
    fetch(`/api/tutors?search=${encodeURIComponent(tutor.name)}`)
      .then(res => res.json())
      .then(json => {
        const found = json.data?.find((t: any) => t.fullName === tutor.name)
        if (found) {
          setSelectedTutorForDetail({
            ...mapped,
            avatar: found.avatarUrl || mapped.avatar,
            bio: found.bio || "Chưa cập nhật giới thiệu.",
            price: found.price ? `${found.price.toLocaleString('vi-VN')}đ/giờ` : "Thỏa thuận",
            experience: found.experience || mapped.experience,
          })
        }
      })
      .catch(err => console.error("Error fetching tutor profile details:", err))
  }

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

  // Convert the student's proposed tutor to standard TutorRecommendation format
  const preferredTutorRec: TutorRecommendation | null = useMemo(() => {
    if (!request.preferredTutor) return null
    const pt = request.preferredTutor
    const initials = pt.name.split(" ").map(p => p[0]).join("").slice(-2).toUpperCase()
    return {
      id: pt.id,
      rawTutorId: pt.id,
      name: pt.name,
      meta: `${pt.educationLevel} · ${pt.major} (${pt.university})`,
      match: "100% Đề xuất",
      avatar: initials,
      tags: [request.subject || "Đúng môn", "Đã duyệt", pt.availableAreas],
      status: "Hồ sơ đã duyệt",
      highlight: "bg-amber-500",
      phone: pt.phone,
      email: pt.email,
    }
  }, [request.preferredTutor, request.subject])

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4"
      onClick={onClose}
    >
      <section
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-5xl rounded-md bg-white shadow-xl flex flex-col"
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

        <div className="flex-1 min-h-0 flex flex-col space-y-3 p-5 overflow-y-auto">
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

          <div className="rounded border border-border p-4 flex flex-col min-h-[430px]">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-sm font-bold">Gia sư được đề xuất</h3>
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

            <div className="mt-4 grid gap-3 md:grid-cols-2 pr-1 py-0.5">
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
              ) : (filteredTutors.length || preferredTutorRec) ? (
                <>
                  {preferredTutorRec && (
                    <div className="col-span-full border-2 border-amber-300 rounded-lg p-4 bg-amber-50/20 relative flex flex-col gap-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                          ⭐ Gia sư được học viên đề xuất
                        </span>
                      </div>
                      <TutorRecommendationCard
                        actionLabel={status === "Đã ghép" ? "Tạo lớp học" : "Chờ đồng ý"}
                        href={status === "Đã ghép"
                          ? `/staff/request-management/create-class?requestId=${encodeURIComponent(
                              request.rawId
                            )}&tutorId=${encodeURIComponent(preferredTutorRec.rawTutorId)}&tutorName=${encodeURIComponent(
                              preferredTutorRec.name
                            )}`
                          : undefined}
                        tutor={preferredTutorRec}
                        onViewSchedule={() => setActiveScheduleModal({ id: preferredTutorRec.rawTutorId, name: preferredTutorRec.name, role: "tutor" })}
                        onViewDetail={() => handleOpenTutorDetail(preferredTutorRec)}
                      />
                    </div>
                  )}

                  {filteredTutors.map((tutor) => {
                  const isMatched = status === "Đã ghép"
                  const isCancelled = status === "Đã hủy"
                  const actionLabel = isMatched ? "Tạo lớp học" : isCancelled ? "Bị hủy" : "Chờ đồng ý"
                  const href = isMatched
                    ? `/staff/request-management/create-class?requestId=${encodeURIComponent(
                        request.rawId
                      )}&tutorId=${encodeURIComponent(tutor.rawTutorId)}&tutorName=${encodeURIComponent(
                        tutor.name
                      )}`
                    : undefined
                  return (
                    <TutorRecommendationCard
                      key={tutor.rawTutorId}
                      actionLabel={actionLabel}
                      href={href}
                      tutor={tutor}
                      onViewSchedule={() => setActiveScheduleModal({ id: tutor.rawTutorId, name: tutor.name, role: "tutor" })}
                      onViewDetail={() => handleOpenTutorDetail(tutor)}
                    />
                  )
                })}
                </>
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
          request={request}
        />
      )}

      {/* Sub-modal: Tutor Detail View */}
      {selectedTutorForDetail && (
        <TutorDetailModal
          tutor={selectedTutorForDetail}
          onClose={() => setSelectedTutorForDetail(null)}
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
  request: RequestItem
}

function ScheduleViewDialog({ id, name, role, onClose, request }: ScheduleViewDialogProps) {
  const [tutorSchedules, setTutorSchedules] = useState<any[]>([])
  const [studentSchedules, setStudentSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    async function loadSchedule() {
      try {
        if (role === "tutor") {
          const [tutorData, studentData] = await Promise.all([
            getTutorScheduleForStaff(id),
            request.studentId ? getStudentScheduleForStaff(request.studentId) : Promise.resolve([])
          ])
          setTutorSchedules(tutorData)
          setStudentSchedules(studentData)
        } else {
          const studentData = await getStudentScheduleForStaff(id)
          setStudentSchedules(studentData)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadSchedule()
  }, [id, role, request.studentId])

  const timeSlots = [
    { label: "08:00 - 10:00", start: "08:00", end: "10:00" },
    { label: "10:00 - 12:00", start: "10:00", end: "12:00" },
    { label: "14:00 - 16:00", start: "14:00", end: "16:00" },
    { label: "16:00 - 18:00", start: "16:00", end: "18:00" },
    { label: "17:30 - 19:30", start: "17:30", end: "19:30" },
    { label: "19:00 - 21:00", start: "19:00", end: "21:00" },
  ]

  // Parsing requested schedule
  const preferred = useMemo(() => {
    const scheduleStr = request.schedule
    if (!scheduleStr || scheduleStr === "Linh hoạt") return null
    const parts = scheduleStr.split("·")
    if (parts.length !== 2) return null
    const daysPart = parts[0].trim()
    const timePart = parts[1].trim()

    const days: string[] = []
    const allDayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]
    allDayNames.forEach((d) => {
      if (daysPart.includes(d)) days.push(d)
    })

    const timeParts = timePart.split("-")
    if (timeParts.length !== 2) return null
    const startTime = timeParts[0].trim()
    const endTime = timeParts[1].trim()

    return { days, startTime, endTime }
  }, [request.schedule])

  function isSlotRequested(day: string, slotStart: string, slotEnd: string) {
    if (!preferred) return false
    const dayMatched = preferred.days.includes(day)
    if (!dayMatched) return false
    return (preferred.startTime < slotEnd && preferred.endTime > slotStart)
  }

  function getTutorSession(day: string, slotStart: string, slotEnd: string) {
    return tutorSchedules.find((s) => {
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
      slotDate.setHours(12, 0, 0, 0) // avoid timezone shifts

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

  function getStudentSession(day: string, slotStart: string, slotEnd: string) {
    return studentSchedules.find((s) => {
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
      slotDate.setHours(12, 0, 0, 0) // avoid timezone shifts

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-white rounded-xl shadow-xl flex flex-col max-h-[85vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary shrink-0" />
            <h3 className="text-sm font-bold text-foreground">
              {role === "tutor" ? (
                <span>So khớp lịch thông minh: Học viên <span className="text-primary">{request.name}</span> ↔ Gia sư <span className="text-primary">{name}</span></span>
              ) : (
                <span>Lịch bận hiện tại của Học viên: <span className="text-primary">{name}</span></span>
              )}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted"
            type="button"
          >
            <X size={15} />
          </button>
        </div>

        {/* Legend for Smart Compare */}
        {role === "tutor" && (
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center gap-4 text-[10px] text-muted-foreground font-semibold flex-wrap">
            <span className="flex items-center gap-1"><span className="size-2 bg-emerald-500 rounded-full" /> Khớp yêu cầu & Rảnh (Khuyên dùng)</span>
            <span className="flex items-center gap-1"><span className="size-2 bg-red-500 rounded-full" /> Yêu cầu bị Trùng (Conflict)</span>
            <span className="flex items-center gap-1"><span className="size-2 bg-slate-400 rounded-full" /> Lịch bận khác</span>
            <span className="flex items-center gap-1"><span className="size-2 border border-slate-300 bg-white rounded-full" /> Trống</span>
            <span className="ml-auto text-primary italic font-bold">Lớp yêu cầu: {request.schedule}</span>
          </div>
        )}

        {/* Content Table */}
        <div className="overflow-y-auto p-5 flex-1 min-h-0">
          <div className="flex items-center justify-between gap-3 mb-4 text-xs font-semibold bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <button
              onClick={handlePrevWeek}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
            >
              &larr; Tuần trước
            </button>
            <span className="text-slate-700 font-bold">{weekRangeText}</span>
            <button
              onClick={handleNextWeek}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
            >
              Tuần sau &rarr;
            </button>
          </div>

          {loading ? (
            <div className="space-y-3 py-6">
              <div className="h-5 w-full bg-slate-100 rounded animate-pulse" />
              <div className="h-20 w-full bg-slate-50 border border-slate-100 rounded animate-pulse" />
              <div className="h-20 w-full bg-slate-50 border border-slate-100 rounded animate-pulse" />
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-150 rounded-lg">
              <table className="w-full border-collapse text-left text-xs min-w-[650px]">
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
                        const tutorSession = role === "tutor" ? getTutorSession(day.name, slot.start, slot.end) : null
                        const studentSession = getStudentSession(day.name, slot.start, slot.end)
                        const requested = isSlotRequested(day.name, slot.start, slot.end)

                        let bgClass = "bg-white text-slate-300"
                        let cellContent = <span className="text-[8px] font-medium opacity-20">— Trống —</span>

                        if (role === "tutor") {
                          if (requested) {
                            if (tutorSession || studentSession) {
                              bgClass = "bg-red-50 text-red-900 border-red-150"
                              cellContent = (
                                <div className="flex flex-col items-center justify-center p-0.5 rounded border border-red-200 bg-white shadow-xs max-w-[90px] mx-auto text-[7px]">
                                  <span className="font-bold text-red-700 text-[8px] uppercase tracking-wide">✗ Bị trùng</span>
                                  <span className="text-[6.5px] text-slate-500 font-semibold mt-0.5">
                                    {tutorSession && studentSession ? "Cả hai bận" : tutorSession ? "Gia sư bận" : "Học viên bận"}
                                  </span>
                                </div>
                              )
                            } else {
                              bgClass = "bg-emerald-50 text-emerald-900 border-emerald-150 font-bold"
                              cellContent = (
                                <div className="flex flex-col items-center justify-center p-0.5 rounded border border-emerald-300 bg-emerald-100/50 shadow-xs max-w-[90px] mx-auto text-[7px]">
                                  <span className="font-bold text-emerald-800 text-[8px] uppercase tracking-wide">✓ Khuyên dùng</span>
                                  <span className="text-[6.5px] text-emerald-700 font-bold mt-0.5">Trống & Khớp</span>
                                </div>
                              )
                            }
                          } else {
                            if (tutorSession || studentSession) {
                              bgClass = "bg-slate-50 text-slate-500"
                              cellContent = (
                                <div className="flex flex-col items-center justify-center p-0.5 rounded border border-slate-200 bg-white shadow-xs max-w-[90px] mx-auto text-[7px]">
                                  <span className="font-bold text-slate-500">Bận</span>
                                  <span className="text-[6.5px] text-slate-400 mt-0.5">
                                    {tutorSession && studentSession ? "Cả hai bận" : tutorSession ? "Gia sư bận" : "Học viên bận"}
                                  </span>
                                </div>
                              )
                            }
                          }
                        } else {
                          // Nếu chỉ xem lịch học viên bình thường
                          if (studentSession) {
                            bgClass = "bg-amber-50 text-amber-900"
                            const timeStr = `${studentSession.startTime.slice(0, 5)} - ${studentSession.endTime.slice(0, 5)}`
                            cellContent = (
                              <div className="flex flex-col items-center justify-center p-0.5 rounded border border-amber-200 bg-white shadow-xs max-w-[90px] mx-auto text-[7px] gap-0.5">
                                <span className="font-bold text-amber-800 truncate w-full text-[8px]" title={studentSession.class?.subject?.name || 'Môn học'}>
                                  {studentSession.class?.subject?.name || 'Môn học'}
                                </span>
                                <span className="text-[6.5px] text-slate-500 truncate w-full font-medium">
                                  GS: {studentSession.class?.tutor?.user?.fullName || 'Chưa phân'}
                                </span>
                                <span className="text-[6px] text-amber-700 bg-amber-100/60 px-1 py-0.5 rounded font-bold mt-0.5">
                                  {timeStr}
                                </span>
                              </div>
                            )
                          }
                        }

                        return (
                          <td 
                            key={day.name} 
                            className={`p-1 border-r last:border-r-0 border-slate-150 text-center transition-colors ${bgClass}`}
                          >
                            {cellContent}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


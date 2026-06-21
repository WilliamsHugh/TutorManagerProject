"use client"

import { useEffect, useState } from "react"
import { Search, BookOpen, GraduationCap, MapPin, Phone, Mail, X, Calendar } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import { StaffShell } from "../_components/StaffShell"
import { TablePagination } from "../_components/TablePagination"
import { getStaffTutors, getClasses, getTutorScheduleForStaff } from "@/lib/api"

interface TutorData {
  id: string
  user: {
    id: string
    fullName: string
    email: string
    phone: string
    address: string
    avatarUrl: string
    isActive: boolean
  }
  educationLevel: string
  major: string
  experience: string
  availableAreas: string
  bio: string
  university: string
  graduationYear: string
  approvalStatus: string
  subjects: string[]
}

export default function StaffTutorsPage() {
  const [tutors, setTutors] = useState<TutorData[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTutor, setSelectedTutor] = useState<TutorData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    async function loadTutors() {
      try {
        const data = await getStaffTutors()
        setTutors(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải danh sách gia sư.")
      } finally {
        setLoading(false)
      }
    }
    loadTutors()
  }, [])

  const filtered = tutors.filter((t) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      t.user?.fullName?.toLowerCase().includes(q) ||
      t.user?.email?.toLowerCase().includes(q) ||
      t.user?.phone?.includes(q) ||
      t.subjects?.some((s) => s.toLowerCase().includes(q)) ||
      t.major?.toLowerCase().includes(q) ||
      t.availableAreas?.toLowerCase().includes(q)
    )
  })

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700 font-semibold border-emerald-200">Đã duyệt</Badge>
      case "rejected":
        return <Badge className="rounded-md bg-red-100 px-2 py-0.5 text-[11px] text-red-700 font-semibold border-red-200">Từ chối</Badge>
      default:
        return <Badge className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] text-amber-700 font-semibold border-amber-200">Chờ duyệt</Badge>
    }
  }

  return (
    <StaffShell current="Danh sách" parent="Quản lý Gia sư">
      <Card className="rounded-md border-border shadow-none">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Quản lý Gia sư</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Tra cứu hồ sơ gia sư đã duyệt, trạng thái nhận lớp và thông tin chi tiết.
              </p>
            </div>
            <div className="relative w-full max-w-[360px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                className="h-8 rounded pl-9 text-xs"
                placeholder="Tìm theo tên, email, môn học, khu vực..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          ) : null}

          {loading ? (
            <div className="overflow-hidden rounded border border-border">
              <div className="grid min-w-[900px] grid-cols-[1fr_1.2fr_1fr_1fr_100px] bg-[#e9eff7] px-4 py-2.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="h-4 w-20 bg-slate-300 rounded animate-pulse" />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, rowIdx) => (
                <div key={rowIdx} className="grid min-w-[900px] grid-cols-[1fr_1.2fr_1fr_1fr_100px] items-center border-t border-border bg-white px-4 py-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-muted animate-pulse shrink-0" />
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3.5 w-28 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                    <div className="h-3.5 w-32 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3.5 w-24 bg-muted rounded animate-pulse" />
                  </div>
                  <div>
                    <div className="h-6 w-16 bg-muted rounded-md animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {search ? "Không tìm thấy gia sư phù hợp." : "Chưa có gia sư nào trong hệ thống."}
            </div>
          ) : (
            <div className="overflow-x-auto rounded border border-border">
              <div className="min-w-[900px] flex flex-col">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_1.2fr_1fr_1fr_100px] bg-[#e9eff7] px-4 py-2.5 text-[11px] font-bold text-muted-foreground shrink-0">
                  <div>Gia sư</div>
                  <div>Liên hệ</div>
                  <div>Học vấn & Chuyên môn</div>
                  <div>Khu vực & Môn dạy</div>
                  <div>Trạng thái</div>
                </div>

                {/* Table body */}
                <div className="max-h-[500px] overflow-y-auto divide-y divide-border">
                  {paginated.map((tutor) => (
                      <div
                        key={tutor.id}
                        onClick={() => setSelectedTutor(tutor)}
                        className="grid grid-cols-[1fr_1.2fr_1fr_1fr_100px] items-center bg-white px-4 py-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        {/* Gia sư */}
                        <div className="flex items-center gap-3 min-w-0">
                          {tutor.user?.avatarUrl ? (
                            <img
                              src={tutor.user.avatarUrl}
                              alt={tutor.user.fullName}
                              className="size-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                              {tutor.user?.fullName?.charAt(0)?.toUpperCase() || "G"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground truncate" title={tutor.user?.fullName || "Chưa cập nhật"}>
                              {tutor.user?.fullName || "Chưa cập nhật"}
                            </div>
                            {tutor.bio && (
                              <div className="text-[10px] text-muted-foreground truncate" title={tutor.bio}>
                                {tutor.bio}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Liên hệ */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail size={11} className="shrink-0" />
                            <span className="truncate" title={tutor.user?.email}>{tutor.user?.email || "—"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone size={11} className="shrink-0" />
                            <span className="truncate" title={tutor.user?.phone || ""}>{tutor.user?.phone || "—"}</span>
                          </div>
                        </div>

                        {/* Học chuyên môn */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <GraduationCap size={11} className="text-muted-foreground" />
                            <span className="font-medium">{tutor.educationLevel || "—"}</span>
                          </div>
                          <div className="text-muted-foreground">
                            {tutor.major ? `${tutor.major}` : "—"}
                            {tutor.university ? ` - ${tutor.university}` : ""}
                          </div>
                          {tutor.experience && (
                            <div className="text-[10px] text-muted-foreground truncate max-w-44">{tutor.experience}</div>
                          )}
                        </div>

                        {/* Khu vực & Môn dạy */}
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin size={11} className="shrink-0" />
                            <span className="truncate" title={tutor.availableAreas}>{tutor.availableAreas || "Toàn quốc"}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {tutor.subjects?.length > 0 ? (
                              tutor.subjects.slice(0, 3).map((sub) => (
                                <span key={sub} className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-100 shrink-0">
                                  <BookOpen size={9} />
                                  {sub}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted-foreground">Chưa đăng ký</span>
                            )}
                            {tutor.subjects?.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">+{tutor.subjects.length - 3}</span>
                            )}
                          </div>
                        </div>

                        {/* Trạng thái */}
                        <div className="flex justify-center">
                          {statusBadge(tutor.approvalStatus)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {!loading && (
            <div className="flex flex-col gap-4">
              <div className="text-[11px] text-muted-foreground">
                Tổng số: <strong>{filtered.length}</strong> gia sư
                {search && filtered.length !== tutors.length && (
                  <span> (lọc từ {tutors.length})</span>
                )}
              </div>
              <TablePagination
                currentPage={currentPage}
                totalItems={filtered.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                itemName="gia sư"
              />
            </div>
          )}
        </CardContent>
      </Card>
      {selectedTutor && (
        <TutorProfileDialog
          tutor={selectedTutor}
          onClose={() => setSelectedTutor(null)}
        />
      )}
    </StaffShell>
  )
}

type TutorProfileDialogProps = {
  tutor: TutorData
  onClose: () => void
}

function TutorProfileDialog({ tutor, onClose }: TutorProfileDialogProps) {
  const [classes, setClasses] = useState<any[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [schedules, setSchedules] = useState<any[]>([])
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)

  useEffect(() => {
    async function loadTutorClasses() {
      try {
        const all = await getClasses()
        const filtered = all.filter((cls: any) => cls.tutor?.id === tutor.id)
        setClasses(filtered)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingClasses(false)
      }
    }
    loadTutorClasses()
  }, [tutor.id])

  useEffect(() => {
    async function loadSchedule() {
      if (!showSchedule) return
      setLoadingSchedule(true)
      try {
        const data = await getTutorScheduleForStaff(tutor.id)
        setSchedules(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingSchedule(false)
      }
    }
    loadSchedule()
  }, [tutor.id, showSchedule])

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

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs text-emerald-700 font-semibold border-emerald-200">Đã duyệt</Badge>
      case "rejected":
        return <Badge className="rounded-md bg-red-100 px-2.5 py-0.5 text-xs text-red-700 font-semibold border-red-200">Từ chối</Badge>
      default:
        return <Badge className="rounded-md bg-amber-100 px-2.5 py-0.5 text-xs text-amber-700 font-semibold border-amber-200">Chờ duyệt</Badge>
    }
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
          <h2 className="text-base font-bold">Hồ sơ chi tiết Gia sư</h2>
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
            {tutor.user?.avatarUrl ? (
              <img
                src={tutor.user.avatarUrl}
                alt={tutor.user.fullName}
                className="size-14 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-extrabold text-xl">
                {tutor.user?.fullName?.charAt(0)?.toUpperCase() || "G"}
              </div>
            )}
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">{tutor.user?.fullName || "Chưa cập nhật"}</h3>
              <div>{statusBadge(tutor.approvalStatus)}</div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Thông tin liên hệ</h4>
            <div className="grid gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500 w-16">Email:</span>
                <span className="text-foreground">{tutor.user?.email || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500 w-16">SĐT:</span>
                <span className="text-foreground">{tutor.user?.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500 w-16">Địa chỉ:</span>
                <span className="text-foreground">{tutor.user?.address || "—"}</span>
              </div>
            </div>
          </div>

          {/* Education Details */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Học vấn & Trình độ</h4>
            <div className="grid gap-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-muted-foreground font-medium">Trình độ học vấn</span>
                <span className="font-bold text-foreground">{tutor.educationLevel || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-muted-foreground font-medium">Chuyên ngành</span>
                <span className="font-semibold text-foreground">{tutor.major || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-muted-foreground font-medium">Trường đại học</span>
                <span className="font-semibold text-foreground">{tutor.university || "—"}</span>
              </div>
              {tutor.graduationYear && (
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-muted-foreground font-medium">Năm tốt nghiệp</span>
                  <span className="font-semibold text-foreground">{tutor.graduationYear}</span>
                </div>
              )}
            </div>
          </div>

          {/* Subjects and Areas */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Môn dạy & Khu vực</h4>
            <div className="space-y-2 text-xs">
              <div className="space-y-1.5">
                <span className="text-muted-foreground font-medium block">Môn học đăng ký:</span>
                <div className="flex flex-wrap gap-1.5">
                  {tutor.subjects?.length > 0 ? (
                    tutor.subjects.map((sub) => (
                      <span key={sub} className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
                        <BookOpen size={10} />
                        {sub}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">Chưa đăng ký môn dạy</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground font-medium block">Khu vực nhận dạy:</span>
                <span className="font-semibold text-foreground block">{tutor.availableAreas || "Toàn quốc"}</span>
              </div>
            </div>
          </div>

          {/* Bio / Experience */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Mô tả bản thân & Kinh nghiệm</h4>
            <div className="space-y-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              {tutor.experience && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Kinh nghiệm dạy</span>
                  <p className="text-foreground leading-relaxed font-medium whitespace-pre-wrap">{tutor.experience}</p>
                </div>
              )}
              {tutor.bio && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Giới thiệu ngắn</span>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{tutor.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Classes list */}
          <div className="space-y-4">
            {loadingClasses ? (
              <div className="h-10 bg-muted rounded animate-pulse" />
            ) : (
              <>
                {/* Active classes */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Lớp đang dạy ({classes.filter(c => c.status === "active" || c.status === "suspended").length})</h4>
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
                                <span>Học viên: {cls.student?.user?.fullName || "—"}</span>
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
                      Không có lớp nào đang dạy.
                    </div>
                  )}
                </div>

                {/* Past classes */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Lớp đã dạy ({classes.filter(c => c.status === "completed" || c.status === "cancelled").length})</h4>
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
                                <span>Học viên: {cls.student?.user?.fullName || "—"}</span>
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
                      Chưa có lịch sử lớp đã dạy.
                    </div>
                  )}
                </div>
              </>
            )}
            {/* Lịch dạy / Lịch bận */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-between font-bold text-xs text-slate-400 hover:text-slate-600 uppercase tracking-wider transition-colors"
                onClick={() => setShowSchedule(!showSchedule)}
              >
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400 shrink-0" />
                  Thời khóa biểu & Lịch dạy bận
                </span>
                <span>{showSchedule ? "▲ Thu gọn" : "▼ Mở rộng"}</span>
              </button>

              {showSchedule && (
                <div className="space-y-2 text-xs">
                  {loadingSchedule ? (
                    <div className="h-20 w-full bg-slate-50 border border-slate-100 rounded-lg animate-pulse flex items-center justify-center text-slate-400">
                      Đang tải lịch biểu bận...
                    </div>
                  ) : schedules.length > 0 ? (
                    <div className="overflow-x-auto border border-slate-150 rounded-lg bg-white">
                      <table className="w-full border-collapse text-left text-[11px] min-w-[550px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150 text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                            <th className="p-2 border-r border-slate-150 w-[120px]">Khung giờ</th>
                            {daysOfWeek.map((day) => (
                              <th key={day} className="p-2 text-center border-r last:border-r-0 border-slate-150">{day}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {timeSlots.map((slot) => (
                            <tr key={slot.label} className="border-b last:border-b-0 border-slate-150 hover:bg-slate-50/30">
                              <td className="p-2 font-semibold text-slate-600 bg-slate-50/50 border-r border-slate-150 text-[10px]">
                                {slot.label}
                              </td>
                              {daysOfWeek.map((day) => {
                                const session = getSessionInSlot(day, slot.start, slot.end)
                                return (
                                  <td 
                                    key={day} 
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
                                          HV: {session.class.student?.user?.fullName || "Ẩn danh"}
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
                      Chưa có lịch dạy/lịch học bận nào (Không có lớp học hoạt động).
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

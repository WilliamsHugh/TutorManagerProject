"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Search, BookOpen, GraduationCap, MapPin, Phone, Mail, X, Calendar } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import { StaffShell } from "../_components/StaffShell"
import { TablePagination } from "../_components/TablePagination"
import { AlertWindow } from "../../../(portal)/student/_components/AlertWindow"
import { getStaffTutors, getClasses, getTutorScheduleForStaff, toggleUserStatusForStaff, deleteUserForStaff } from "@/lib/api"
import { TutorProfileDialog, type TutorData } from "../_components/TutorProfileDialog"

export default function StaffTutorsPage() {
  const [tutors, setTutors] = useState<TutorData[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTutor, setSelectedTutor] = useState<TutorData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [toastAlert, setToastAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  })

  const showToast = useCallback((title: string, message: string, type: "success" | "error" | "warning") => {
    setToastAlert({ isOpen: true, title, message, type })
  }, [])

  const loadTutors = useCallback(async () => {
    try {
      const data = await getStaffTutors()
      setTutors(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách gia sư.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTutors()
  }, [loadTutors])

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
          onRefresh={loadTutors}
          showToast={showToast}
        />
      )}
      <AlertWindow
        isOpen={toastAlert.isOpen}
        title={toastAlert.title}
        message={toastAlert.message}
        type={toastAlert.type}
        onClose={() => setToastAlert({ ...toastAlert, isOpen: false })}
      />
    </StaffShell>
  )
}



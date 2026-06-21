"use client"

import { useEffect, useState } from "react"
import { Search, Mail, Phone, MapPin, GraduationCap, School, UserRound, X } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import { StaffShell } from "../_components/StaffShell"
import { TablePagination } from "../_components/TablePagination"
import { getStaffStudents, getClasses } from "@/lib/api"

interface StudentData {
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

export default function StaffStudentsPage() {
  const [students, setStudents] = useState<StudentData[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)
  const pageSize = 10

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await getStaffStudents()
        setStudents(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải danh sách học viên.")
      } finally {
        setLoading(false)
      }
    }
    loadStudents()
  }, [])

  const filtered = students.filter((s) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      s.user?.fullName?.toLowerCase().includes(q) ||
      s.user?.email?.toLowerCase().includes(q) ||
      s.user?.phone?.includes(q) ||
      s.parentName?.toLowerCase().includes(q) ||
      s.schoolName?.toLowerCase().includes(q) ||
      s.gradeLevel?.toLowerCase().includes(q)
    )
  })

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <StaffShell current="Danh sách" parent="Quản lý Học viên">
      <Card className="rounded-md border-border shadow-none">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Quản lý Học viên</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Tra cứu thông tin học viên, phụ huynh và các yêu cầu đã gửi.
              </p>
            </div>
            <div className="relative w-full max-w-[360px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                className="h-8 rounded pl-9 text-xs"
                placeholder="Tìm theo tên, email, SĐT, phụ huynh..."
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
              <div className="grid min-w-[1000px] grid-cols-[1fr_1.2fr_1fr_1fr_1fr] bg-[#e9eff7] px-4 py-2.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="h-4 w-20 bg-slate-300 rounded animate-pulse" />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, rowIdx) => (
                <div key={rowIdx} className="grid min-w-[1000px] grid-cols-[1fr_1.2fr_1fr_1fr_1fr] items-center border-t border-border bg-white px-4 py-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-muted animate-pulse shrink-0" />
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
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {search ? "Không tìm thấy học viên phù hợp." : "Chưa có học viên nào trong hệ thống."}
            </div>
          ) : (
            <div className="overflow-x-auto rounded border border-border">
              <div className="min-w-[1000px] flex flex-col">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_1.2fr_1fr_1fr_1fr] bg-[#e9eff7] px-4 py-2.5 text-[11px] font-bold text-muted-foreground shrink-0">
                  <div>Học viên</div>
                  <div>Liên hệ</div>
                  <div>Học tập</div>
                  <div>Phụ huynh</div>
                  <div>Ngày tham gia</div>
                </div>

                {/* Table body */}
                <div className="max-h-[500px] overflow-y-auto divide-y divide-border">
                  {paginated.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className="grid grid-cols-[1fr_1.2fr_1fr_1fr_1fr] items-center bg-white px-4 py-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      {/* Học viên */}
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {student.user?.fullName?.charAt(0)?.toUpperCase() || "H"}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{student.user?.fullName || "Chưa cập nhật"}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Badge className="rounded-full bg-blue-50 px-2 py-0 text-[10px] text-blue-700 font-medium border-blue-100">
                              Học viên
                            </Badge>
                            {!student.user?.isActive && (
                              <Badge className="rounded-full bg-red-50 px-2 py-0 text-[10px] text-red-700 font-medium border-red-100">
                                Đã khóa
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Liên hệ */}
                      <div className="space-y-1 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail size={11} />
                          <span>{student.user?.email || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={11} />
                          <span>{student.user?.phone || "—"}</span>
                        </div>
                        {student.user?.address && (
                          <div className="flex items-center gap-1.5">
                            <MapPin size={11} />
                            <span className="truncate">{student.user.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Học tập */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap size={11} className="text-muted-foreground" />
                          <span>{student.gradeLevel || "Chưa cập nhật"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <School size={11} />
                          <span className="truncate">{student.schoolName || "Chưa cập nhật"}</span>
                        </div>
                      </div>

                      {/* Phụ huynh */}
                      <div className="space-y-1">
                        {student.parentName ? (
                          <>
                            <div className="flex items-center gap-1.5">
                              <UserRound size={11} className="text-muted-foreground" />
                              <span className="font-medium">{student.parentName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone size={11} />
                              <span>{student.parentPhone || "—"}</span>
                            </div>
                            {student.parentEmail && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Mail size={11} />
                                <span className="truncate">{student.parentEmail}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Không có thông tin</span>
                        )}
                      </div>

                      {/* Ngày tham gia */}
                      <div className="text-muted-foreground">
                        {student.user?.createdAt
                          ? new Date(student.user.createdAt).toLocaleDateString("vi-VN")
                          : "—"}
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
                Tổng số: <strong>{filtered.length}</strong> học viên
                {search && filtered.length !== students.length && (
                  <span> (lọc từ {students.length})</span>
                )}
              </div>
              <TablePagination
                currentPage={currentPage}
                totalItems={filtered.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                itemName="học viên"
              />
            </div>
          )}
        </CardContent>
      </Card>
      {selectedStudent && (
        <StudentProfileDialog
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </StaffShell>
  )
}

type StudentProfileDialogProps = {
  student: StudentData
  onClose: () => void
}

function StudentProfileDialog({ student, onClose }: StudentProfileDialogProps) {
  const [classes, setClasses] = useState<any[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-7"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-xl flex flex-col max-h-[85vh]"
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
              <div className="h-10 bg-muted rounded animate-pulse" />
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
          </div>
        </div>
      </div>
    </div>
  )
}

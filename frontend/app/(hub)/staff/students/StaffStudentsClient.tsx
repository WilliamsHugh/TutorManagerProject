"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Search, Mail, Phone, MapPin, GraduationCap, School, UserRound, X, Calendar } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import { StaffShell } from "../_components/StaffShell"
import { TablePagination } from "../_components/TablePagination"
import { AlertWindow } from "../../../(portal)/student/_components/AlertWindow"
import { getStaffStudents, getClasses, getStudentScheduleForStaff, toggleUserStatusForStaff, deleteUserForStaff } from "@/lib/api"
import { StudentProfileDialog, type StudentData } from "../_components/StudentProfileDialog"

export default function StaffStudentsClient() {
  const [students, setStudents] = useState<StudentData[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)
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

  const loadStudents = useCallback(async () => {
    try {
      const data = await getStaffStudents()
      setStudents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách học viên.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

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
          onRefresh={loadStudents}
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



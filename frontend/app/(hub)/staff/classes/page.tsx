"use client"

import { useEffect, useMemo, useState } from "react"
import { BookOpen, CalendarDays, MapPin, Search, Clock, Mail, Phone, GraduationCap, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getClasses, getLearningReports } from "@/lib/api"
import type { StaffClassItem } from "@/types/staff"
import { mapStaffClass } from "@/types/staff"

import { StaffShell } from "../_components/StaffShell"
import { TablePagination } from "../_components/TablePagination"

export default function StaffClassesPage() {
  const [classes, setClasses] = useState<StaffClassItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedClass, setSelectedClass] = useState<StaffClassItem | null>(null)
  const pageSize = 10

  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await getClasses()
        setClasses(data.map(mapStaffClass))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải danh sách lớp học.")
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
  }, [])

  const filteredClasses = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return classes
    return classes.filter((item) =>
      [
        item.code,
        item.studentName,
        item.tutorName,
        item.subject,
        item.location,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    )
  }, [classes, search])

  const paginated = useMemo(() => {
    return filteredClasses.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [filteredClasses, currentPage])

  return (
    <StaffShell current="Danh sách" parent="Quản lý Lớp học">
      <Card className="rounded-md border-border shadow-none">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Quản lý Lớp học</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Theo dõi các lớp đã ghép thành công, trạng thái vận hành và thông tin học phí.
              </p>
            </div>
            <div className="relative w-full max-w-[360px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={14}
              />
              <Input
                className="h-8 rounded pl-9 text-xs"
                placeholder="Tìm mã lớp, học viên, gia sư..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <div className="overflow-x-auto rounded border border-border">
            <div className="min-w-[980px] flex flex-col">
              {/* Table header */}
              <div className="grid grid-cols-[120px_1fr_1fr_150px_140px_150px_120px] bg-[#e9eff7] px-3 py-2 text-[11px] font-bold text-muted-foreground shrink-0">
                <div>Mã lớp</div>
                <div>Học viên</div>
                <div>Gia sư</div>
                <div>Môn học</div>
                <div>Thời gian</div>
                <div>Học phí</div>
                <div>Trạng thái</div>
              </div>

              {loading ? (
                <div className="divide-y divide-border">
                  {Array.from({ length: 5 }).map((_, rowIdx) => (
                    <div key={rowIdx} className="grid grid-cols-[120px_1fr_1fr_150px_140px_150px_120px] items-center bg-white px-3 py-4 gap-4">
                      <div>
                        <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                      </div>
                      <div>
                        <div className="h-4.5 w-28 bg-muted rounded animate-pulse" />
                      </div>
                      <div>
                        <div className="h-4.5 w-28 bg-muted rounded animate-pulse" />
                      </div>
                      <div>
                        <div className="h-4.5 w-24 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3.5 w-20 bg-muted rounded animate-pulse" />
                        <div className="h-3.5 w-24 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-4.5 w-16 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                      </div>
                      <div>
                        <div className="h-6 w-16 bg-muted rounded-md animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto divide-y divide-border">
                  {paginated.length ? (
                    paginated.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedClass(item)}
                        className="grid grid-cols-[120px_1fr_1fr_150px_140px_150px_120px] items-center bg-white px-3 py-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="font-bold">{item.code}</div>
                        <div>{item.studentName}</div>
                        <div>{item.tutorName}</div>
                        <div className="flex items-center gap-2 font-semibold">
                          <BookOpen size={13} />
                          {item.subject}
                        </div>
                        <div className="space-y-1 text-muted-foreground">
                          {item.startDate !== "Chưa cập nhật" || item.location !== "Chưa cập nhật" ? (
                            <>
                              {item.startDate !== "Chưa cập nhật" && (
                                <div className="flex items-center gap-1">
                                  <CalendarDays size={12} />
                                  {item.startDate}
                                </div>
                              )}
                              {item.location !== "Chưa cập nhật" && (
                                <div className="flex items-center gap-1 flex-1 min-w-0">
                                  <MapPin size={12} className="shrink-0" />
                                  <span className="truncate" title={item.location}>{item.location}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-[11px] italic text-slate-400">Chưa cập nhật</span>
                          )}
                        </div>
                        <div>
                          {item.feePerSession !== "Chưa cập nhật" ? (
                            <>
                              <div className="font-semibold">{item.feePerSession}đ/buổi</div>
                              {item.totalSessions !== "Chưa cập nhật" && (
                                <div className="text-muted-foreground text-[10px]">{item.totalSessions}</div>
                              )}
                            </>
                          ) : (
                            <span className="text-[11px] italic text-slate-400">Chưa cập nhật</span>
                          )}
                        </div>
                        <div>
                          {getStatusBadge(item.status, "sm")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white px-3 py-6 text-sm text-muted-foreground text-center">
                      Chưa có lớp học phù hợp.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {!loading && (
            <div className="flex flex-col gap-4">
              <div className="text-[11px] text-muted-foreground">
                Tổng số: <strong>{filteredClasses.length}</strong> lớp học
                {search && filteredClasses.length !== classes.length && (
                  <span> (lọc từ {classes.length})</span>
                )}
              </div>
              <TablePagination
                currentPage={currentPage}
                totalItems={filteredClasses.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                itemName="lớp học"
              />
            </div>
          )}
        </CardContent>
      </Card>
      {selectedClass && (
        <ClassDetailDialog
          classItem={selectedClass}
          onClose={() => setSelectedClass(null)}
        />
      )}
    </StaffShell>
  )
}

function getStatusBadge(status?: string, size: "sm" | "md" = "sm") {
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

function ClassDetailDialog({ classItem, onClose }: ClassDetailDialogProps) {
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
            {getStatusBadge(classItem.status)}
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

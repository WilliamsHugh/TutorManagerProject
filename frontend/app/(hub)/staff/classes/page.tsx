"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { BookOpen, CalendarDays, MapPin, Search, Clock, Mail, Phone, GraduationCap, X, Download } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getClasses, getLearningReports } from "@/lib/api"
import type { StaffClassItem } from "@/types/staff"
import { mapStaffClass } from "@/types/staff"

import { StaffShell } from "../_components/StaffShell"
import { TablePagination } from "../_components/TablePagination"
import { ClassDetailDialog, getStatusBadge } from "../_components/ClassDetailDialog"

export default function StaffClassesPage() {
  const [classes, setClasses] = useState<StaffClassItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedClass, setSelectedClass] = useState<StaffClassItem | null>(null)
  const pageSize = 10

  const loadClasses = useCallback(async () => {
    try {
      const data = await getClasses()
      setClasses(data.map(mapStaffClass))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách lớp học.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClasses()
  }, [loadClasses])

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

  function exportCsv() {
    const header = [
      "Mã lớp",
      "Học viên",
      "Gia sư",
      "Môn học",
      "Trạng thái",
      "Ngày bắt đầu",
      "Địa điểm học",
      "Học phí/Buổi",
      "Tổng số buổi"
    ]
    const body = classes.map((item) => [
      item.code,
      item.studentName,
      item.tutorName,
      item.subject,
      item.status,
      item.startDate,
      item.location,
      item.feePerSession,
      item.totalSessions,
    ])
    const csv = [header, ...body]
      .map((row) => row.map((cell) => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "danh-sach-lop-hoc.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

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
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                className="h-8 rounded text-xs gap-1.5"
                variant="outline"
                type="button"
                onClick={exportCsv}
              >
                <Download size={14} />
                Xuất CSV
              </Button>
              <div className="relative w-full max-w-[360px] flex-1 sm:flex-initial">
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
          onRefresh={loadClasses}
        />
      )}
    </StaffShell>
  )
}


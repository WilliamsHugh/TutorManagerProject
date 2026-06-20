"use client"

import { useEffect, useMemo, useState } from "react"
import { Download, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getClasses } from "@/lib/api"
import type { StaffClassItem } from "@/types/staff"
import { mapStaffClass } from "@/types/staff"

import { StaffShell } from "../_components/StaffShell"
import { TablePagination } from "../_components/TablePagination"

export default function StaffReportsPage() {
  const [classes, setClasses] = useState<StaffClassItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await getClasses()
        setClasses(data.map(mapStaffClass))
      } catch {
        setClasses([])
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
  }, [])

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return classes
    return classes.filter((item) =>
      [item.code, item.studentName, item.tutorName, item.subject, item.status]
        .join(" ")
        .toLowerCase()
        .includes(query),
    )
  }, [classes, search])

  const paginated = useMemo(() => {
    return rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [rows, currentPage])

  function exportCsv() {
    const header = ["Mã lớp", "Học viên", "Gia sư", "Môn học", "Trạng thái", "Ngày bắt đầu", "Ngày kết thúc"]
    const body = rows.map((item) => [
      item.code,
      item.studentName,
      item.tutorName,
      item.subject,
      item.status,
      item.startDate,
      item.endDate,
    ])
    const csv = [header, ...body]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "bao-cao-tinh-trang-lop-hoc.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <StaffShell current="Tình trạng lớp học" parent="Báo cáo thống kê">
      <Card className="rounded-md border-border shadow-none">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Báo cáo tình trạng lớp học
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Mẫu STAFF_BM3: tổng hợp lớp, học viên, gia sư, môn học và trạng thái.
              </p>
            </div>
            <Button className="h-8 rounded text-xs" type="button" onClick={exportCsv}>
              <Download size={14} />
              Xuất CSV
            </Button>
          </div>

          <div className="relative max-w-[360px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={14}
            />
            <Input
              className="h-8 rounded pl-9 text-xs"
              placeholder="Lọc theo mã lớp, học viên, gia sư..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          <div className="overflow-x-auto rounded border border-border">
            <div className="min-w-[820px] flex flex-col">
              {/* Table header */}
              <div className="grid grid-cols-[110px_1fr_1fr_150px_120px] bg-[#e9eff7] px-3 py-2 text-[11px] font-bold text-muted-foreground shrink-0">
                <div>Mã lớp</div>
                <div>Học viên</div>
                <div>Gia sư</div>
                <div>Môn học</div>
                <div>Trạng thái</div>
              </div>

              {loading ? (
                <div className="divide-y divide-border">
                  {Array.from({ length: 5 }).map((_, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="grid grid-cols-[110px_1fr_1fr_150px_120px] items-center bg-white px-3 py-4 gap-4"
                    >
                      <div>
                        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                      </div>
                      <div>
                        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                      </div>
                      <div>
                        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                      </div>
                      <div>
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      </div>
                      <div>
                        <div className="h-5 w-16 bg-muted rounded animate-pulse" />
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
                        className="grid grid-cols-[110px_1fr_1fr_150px_120px] items-center bg-white px-3 py-3 text-xs"
                      >
                        <div className="font-bold">{item.code}</div>
                        <div>{item.studentName}</div>
                        <div>{item.tutorName}</div>
                        <div>{item.subject}</div>
                        <div>{item.status}</div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white px-3 py-6 text-sm text-muted-foreground text-center">
                      Chưa có dữ liệu báo cáo.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {!loading && (
            <div className="flex flex-col gap-4">
              <div className="text-[11px] text-muted-foreground">
                Tổng số: <strong>{rows.length}</strong> dòng dữ liệu
                {search && rows.length !== classes.length && (
                  <span> (lọc từ {classes.length})</span>
                )}
              </div>
              <TablePagination
                currentPage={currentPage}
                totalItems={rows.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                itemName="dòng báo cáo"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </StaffShell>
  )
}

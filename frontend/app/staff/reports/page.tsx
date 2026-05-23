"use client"

import { useEffect, useMemo, useState } from "react"
import { Download, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getClasses } from "@/lib/staff-api"
import type { StaffClassItem } from "@/types/staff"
import { mapStaffClass } from "@/types/staff"

import { StaffShell } from "../_components/StaffShell"
import { mockStaffClasses } from "../_components/mock-data"

export default function StaffReportsPage() {
  const [classes, setClasses] = useState<StaffClassItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await getClasses()
        setClasses(data.map(mapStaffClass))
      } catch {
        setClasses(mockStaffClasses)
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
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="overflow-hidden rounded border border-border">
            <div className="grid min-w-[820px] grid-cols-[110px_1fr_1fr_150px_120px] bg-[#e9eff7] px-3 py-2 text-[11px] font-bold text-muted-foreground">
              <div>Mã lớp</div>
              <div>Học viên</div>
              <div>Gia sư</div>
              <div>Môn học</div>
              <div>Trạng thái</div>
            </div>

            {loading ? (
              <div className="bg-white px-3 py-6 text-sm text-muted-foreground">
                Đang tải báo cáo...
              </div>
            ) : rows.length ? (
              rows.map((item) => (
                <div
                  key={item.id}
                  className="grid min-w-[820px] grid-cols-[110px_1fr_1fr_150px_120px] border-t border-border bg-white px-3 py-3 text-xs"
                >
                  <div className="font-bold">{item.code}</div>
                  <div>{item.studentName}</div>
                  <div>{item.tutorName}</div>
                  <div>{item.subject}</div>
                  <div>{item.status}</div>
                </div>
              ))
            ) : (
              <div className="bg-white px-3 py-6 text-sm text-muted-foreground">
                Chưa có dữ liệu báo cáo.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </StaffShell>
  )
}

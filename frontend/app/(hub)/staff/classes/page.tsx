"use client"

import { useEffect, useMemo, useState } from "react"
import { BookOpen, CalendarDays, MapPin, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getClasses } from "@/lib/api"
import type { StaffClassItem } from "@/types/staff"
import { mapStaffClass } from "@/types/staff"

import { StaffShell } from "../_components/StaffShell"

export default function StaffClassesPage() {
  const [classes, setClasses] = useState<StaffClassItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <div className="overflow-hidden rounded border border-border">
            <div className="grid min-w-[980px] grid-cols-[120px_1fr_1fr_150px_140px_150px_120px] bg-[#e9eff7] px-3 py-2 text-[11px] font-bold text-muted-foreground">
              <div>Mã lớp</div>
              <div>Học viên</div>
              <div>Gia sư</div>
              <div>Môn học</div>
              <div>Thời gian</div>
              <div>Học phí</div>
              <div>Trạng thái</div>
            </div>

            {loading ? (
              <div className="bg-white px-3 py-6 text-sm text-muted-foreground">
                Đang tải danh sách lớp học...
              </div>
            ) : filteredClasses.length ? (
              filteredClasses.map((item) => (
                <div
                  key={item.id}
                  className="grid min-w-[980px] grid-cols-[120px_1fr_1fr_150px_140px_150px_120px] items-center border-t border-border bg-white px-3 py-3 text-xs"
                >
                  <div className="font-bold">{item.code}</div>
                  <div>{item.studentName}</div>
                  <div>{item.tutorName}</div>
                  <div className="flex items-center gap-2 font-semibold">
                    <BookOpen size={13} />
                    {item.subject}
                  </div>
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarDays size={12} />
                      {item.startDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      {item.location}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">{item.feePerSession}</div>
                    <div className="text-muted-foreground">{item.totalSessions}</div>
                  </div>
                  <div>
                    <Badge className="rounded-md bg-green-600 px-2.5 py-1 text-[11px] text-white">
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white px-3 py-6 text-sm text-muted-foreground">
                Chưa có lớp học phù hợp.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </StaffShell>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Search, Mail, Phone, MapPin, GraduationCap, School, UserRound } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import { StaffShell } from "../_components/StaffShell"
import { getStaffStudents } from "@/lib/api"

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
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          ) : null}

          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Đang tải danh sách học viên...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {search ? "Không tìm thấy học viên phù hợp." : "Chưa có học viên nào trong hệ thống."}
            </div>
          ) : (
            <div className="overflow-hidden rounded border border-border">
              {/* Table header */}
              <div className="grid min-w-[1000px] grid-cols-[1fr_1.2fr_1fr_1fr_1fr] bg-[#e9eff7] px-4 py-2.5 text-[11px] font-bold text-muted-foreground">
                <div>Học viên</div>
                <div>Liên hệ</div>
                <div>Học tập</div>
                <div>Phụ huynh</div>
                <div>Ngày tham gia</div>
              </div>

              {filtered.map((student) => (
                <div
                  key={student.id}
                  className="grid min-w-[1000px] grid-cols-[1fr_1.2fr_1fr_1fr_1fr] items-center border-t border-border bg-white px-4 py-3 text-xs hover:bg-slate-50 transition-colors"
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
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail size={11} />
                      <span className="truncate">{student.user?.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone size={11} />
                      <span>{student.user?.phone || "—"}</span>
                    </div>
                    {student.user?.address && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
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
          )}

          {!loading && (
            <div className="text-[11px] text-muted-foreground">
              Tổng số: <strong>{filtered.length}</strong> học viên
              {search && filtered.length !== students.length && (
                <span> (lọc từ {students.length})</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </StaffShell>
  )
}

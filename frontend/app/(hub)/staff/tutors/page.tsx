"use client"

import { useEffect, useState } from "react"
import { Search, BookOpen, GraduationCap, MapPin, Phone, Mail } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import { StaffShell } from "../_components/StaffShell"
import { getStaffTutors } from "@/lib/api"

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
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          ) : null}

          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Đang tải danh sách gia sư...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {search ? "Không tìm thấy gia sư phù hợp." : "Chưa có gia sư nào trong hệ thống."}
            </div>
          ) : (
            <div className="overflow-hidden rounded border border-border">
              {/* Table header */}
              <div className="grid min-w-[900px] grid-cols-[1fr_1.2fr_1fr_1fr_100px] bg-[#e9eff7] px-4 py-2.5 text-[11px] font-bold text-muted-foreground">
                <div>Gia sư</div>
                <div>Liên hệ</div>
                <div>Học vấn & Chuyên môn</div>
                <div>Khu vực & Môn dạy</div>
                <div>Trạng thái</div>
              </div>

              {filtered.map((tutor) => (
                <div
                  key={tutor.id}
                  className="grid min-w-[900px] grid-cols-[1fr_1.2fr_1fr_1fr_100px] items-center border-t border-border bg-white px-4 py-3 text-xs hover:bg-slate-50 transition-colors"
                >
                  {/* Gia sư */}
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {tutor.user?.fullName?.charAt(0)?.toUpperCase() || "G"}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{tutor.user?.fullName || "Chưa cập nhật"}</div>
                      {tutor.bio && <div className="text-[10px] text-muted-foreground truncate max-w-36">{tutor.bio}</div>}
                    </div>
                  </div>

                  {/* Liên hệ */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail size={11} />
                      <span className="truncate">{tutor.user?.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone size={11} />
                      <span>{tutor.user?.phone || "—"}</span>
                    </div>
                  </div>

                  {/* Học vấn & Chuyên môn */}
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
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin size={11} />
                      <span className="truncate">{tutor.availableAreas || "Toàn quốc"}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tutor.subjects?.length > 0 ? (
                        tutor.subjects.slice(0, 3).map((sub) => (
                          <span key={sub} className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-100">
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
          )}

          {!loading && (
            <div className="text-[11px] text-muted-foreground">
              Tổng số: <strong>{filtered.length}</strong> gia sư
              {search && filtered.length !== tutors.length && (
                <span> (lọc từ {tutors.length})</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </StaffShell>
  )
}

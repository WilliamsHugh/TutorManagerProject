"use client"

import { useEffect, useState } from "react"
import { BookOpen, FileText, GraduationCap, UsersRound } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

import { StaffShell } from "../_components/StaffShell"
import { getStaffStats } from "@/lib/api"

const statConfig = [
  { label: "Yêu cầu cần xử lý", key: "newRequests" as const, icon: FileText },
  { label: "Gia sư khả dụng", key: "activeTutors" as const, icon: UsersRound },
  { label: "Lớp đang theo dõi", key: "activeClasses" as const, icon: BookOpen },
  { label: "Học viên đang học", key: "learningStudents" as const, icon: GraduationCap },
]

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getStaffStats()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu thống kê.")
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <StaffShell current="Tổng quan" parent="Nhân viên">
      {error ? (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        {statConfig.map((item) => {
          const Icon = item.icon
          const value = loading ? "..." : (stats?.[item.key] ?? 0)
          return (
            <Card key={item.key} className="rounded-md border-border shadow-none">
              <CardContent className="space-y-3 p-4">
                <div className="flex size-9 items-center justify-center rounded bg-primary text-primary-foreground">
                  <Icon size={16} />
                </div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </StaffShell>
  )
}

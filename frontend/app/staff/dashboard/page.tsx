import { BookOpen, FileText, GraduationCap, UsersRound } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

import { StaffShell } from "../../hub/components/StaffShell"

const stats = [
  { label: "Yêu cầu cần xử lý", value: "5", icon: FileText },
  { label: "Gia sư khả dụng", value: "4", icon: UsersRound },
  { label: "Lớp đang theo dõi", value: "0", icon: BookOpen },
  { label: "Báo cáo mới", value: "0", icon: GraduationCap },
]

export default function StaffDashboardPage() {
  return (
    <StaffShell current="Tổng quan" parent="Nhân viên">
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="rounded-md border-border shadow-none">
              <CardContent className="space-y-3 p-4">
                <div className="flex size-9 items-center justify-center rounded bg-primary text-primary-foreground">
                  <Icon size={16} />
                </div>
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </StaffShell>
  )
}

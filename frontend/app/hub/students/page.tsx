import { Card, CardContent } from "@/components/ui/card"

import { StaffShell } from "../components/StaffShell"

export default function StaffStudentsPage() {
  return (
    <StaffShell current="Danh sách" parent="Quản lý Học viên">
      <Card className="rounded-md border-border shadow-none">
        <CardContent className="space-y-2 p-5">
          <h1 className="text-xl font-bold tracking-tight">Quản lý Học viên</h1>
          <p className="text-sm text-muted-foreground">
            Màn hình này sẽ dùng để tra cứu thông tin học viên, phụ huynh và các yêu cầu đã gửi.
          </p>
        </CardContent>
      </Card>
    </StaffShell>
  )
}

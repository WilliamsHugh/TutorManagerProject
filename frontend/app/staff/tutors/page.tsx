import { Card, CardContent } from "@/components/ui/card"

import { StaffShell } from "../_components/StaffShell"

export default function StaffTutorsPage() {
  return (
    <StaffShell current="Danh sách" parent="Quản lý Gia sư">
      <Card className="rounded-md border-border shadow-none">
        <CardContent className="space-y-2 p-5">
          <h1 className="text-xl font-bold tracking-tight">Quản lý Gia sư</h1>
          <p className="text-sm text-muted-foreground">
            Màn hình này sẽ dùng để tra cứu hồ sơ gia sư đã duyệt và trạng thái nhận lớp.
          </p>
        </CardContent>
      </Card>
    </StaffShell>
  )
}

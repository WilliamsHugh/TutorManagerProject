import { Card, CardContent } from "@/components/ui/card"

import { RequestPagination } from "./RequestPagination"
import { RequestTable } from "./RequestTable"
import { RequestToolbar } from "./RequestToolbar"
import type { RequestItem } from "@/types/class_request"

type RequestManagementPanelProps = {
  requests: RequestItem[]
  search: string
  totalCount: number
  onSearchChange: (value: string) => void
  onSelectRequest: (request: RequestItem) => void
}

export function RequestManagementPanel({
  requests,
  search,
  totalCount,
  onSearchChange,
  onSelectRequest,
}: RequestManagementPanelProps) {
  return (
    <Card className="rounded-md border-border shadow-none">
      <CardContent className="space-y-4 p-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Quản lý Yêu cầu
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Danh sách chi tiết các yêu cầu tìm gia sư để nhân viên duyệt nhanh
            thông tin và mở dialog ghép gia sư.
          </p>
        </div>

        <RequestToolbar search={search} onSearchChange={onSearchChange} />
        <RequestTable requests={requests} onSelectRequest={onSelectRequest} />
        <RequestPagination totalCount={totalCount} visibleCount={requests.length} />
      </CardContent>
    </Card>
  )
}

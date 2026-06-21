import { Card, CardContent } from "@/components/ui/card"

import { TablePagination } from "./TablePagination"
import { RequestTable } from "./RequestTable"
import { RequestToolbar } from "./RequestToolbar"
import type { RequestItem } from "@/types/class_request"

type RequestManagementPanelProps = {
  requests: RequestItem[]
  search: string
  statusFilter: string
  totalCount: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onSelectRequest: (request: RequestItem) => void
}

export function RequestManagementPanel({
  requests,
  search,
  statusFilter,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onSearchChange,
  onStatusFilterChange,
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

        <RequestToolbar
          search={search}
          statusFilter={statusFilter}
          onSearchChange={onSearchChange}
          onStatusFilterChange={onStatusFilterChange}
        />
        <RequestTable requests={requests} onSelectRequest={onSelectRequest} />
        
        <div className="flex flex-col gap-4">
          <div className="text-[11px] text-muted-foreground">
            Tổng số: <strong>{totalCount}</strong> yêu cầu
          </div>
          <TablePagination
            currentPage={currentPage}
            totalItems={totalCount}
            pageSize={pageSize}
            onPageChange={onPageChange}
            itemName="yêu cầu"
          />
        </div>
      </CardContent>
    </Card>
  )
}

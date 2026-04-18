import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { RequestItem, RequestStatus } from "./types"

type RequestTableProps = {
  requests: RequestItem[]
  onSelectRequest: (request: RequestItem) => void
}

export function RequestTable({
  requests,
  onSelectRequest,
}: RequestTableProps) {
  return (
    <div className="overflow-hidden rounded border border-border">
      <div className="max-h-[365px] overflow-auto">
        <div className="min-w-[960px]">
          <div className="grid grid-cols-[120px_170px_170px_1fr_100px_90px] bg-[#e9eff7] px-3 py-2 text-[11px] font-bold text-muted-foreground">
            <div>Mã YC & Ngày tạo</div>
            <div>Thông tin liên hệ</div>
            <div>Nội dung Yêu cầu</div>
            <div>Chi tiết bổ sung</div>
            <div>Trạng thái</div>
            <div>Thao tác</div>
          </div>

          {requests.map((request) => (
            <div
              key={request.id}
              className="grid cursor-pointer grid-cols-[120px_170px_170px_1fr_100px_90px] items-center border-t border-border bg-white px-3 py-3 text-xs transition-colors hover:bg-secondary/60"
              role="button"
              tabIndex={0}
              onClick={() => onSelectRequest(request)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  onSelectRequest(request)
                }
              }}
            >
              <div>
                <div className="text-base font-bold">{request.id}</div>
                <div className="mt-2 text-muted-foreground">
                  Tạo lúc {request.createdAt}
                </div>
              </div>

              <div>
                <div className="font-bold">{request.name}</div>
                <div className="mt-1 text-muted-foreground">{request.role}</div>
                <div className="mt-2 font-bold">{request.phone}</div>
              </div>

              <div>
                <div className="font-bold">{request.subject}</div>
                <div className="mt-1 text-muted-foreground">
                  {request.level}
                </div>
                <div className="mt-2 text-muted-foreground">{request.area}</div>
              </div>

              <div className="pr-6">
                <div className="font-bold">{request.schedule}</div>
                <p className="mt-2 line-clamp-2 max-w-[340px] text-muted-foreground">
                  {request.note}
                </p>
              </div>

              <div>
                <Badge
                  className={`rounded-md px-2.5 py-1 text-[11px] ${getStatusClasses(
                    request.status
                  )}`}
                >
                  {request.status}
                </Badge>
              </div>

              <div>
                <Button
                  className="h-8 rounded text-xs"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onSelectRequest(request)
                  }}
                >
                  Ghép
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function getStatusClasses(status: RequestStatus) {
  switch (status) {
    case "Chờ xử lý":
      return "bg-orange-500 text-white border-orange-500"
    case "Đang xử lý":
      return "bg-secondary text-secondary-foreground border-secondary"
    case "Đã ghép":
      return "bg-green-600 text-white border-green-600"
  }
}

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { RequestItem, RequestStatus } from "@/types/class_request"

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
      <div className="max-h-[600px] overflow-auto">
        <div className="min-w-[960px]">
          <div className="grid grid-cols-[120px_170px_170px_1fr_100px_90px] bg-[#e9eff7] px-3 py-2 text-[11px] font-bold text-muted-foreground sticky top-0 z-10 shadow-sm">
            <div>Mã YC & Ngày tạo</div>
            <div>Thông tin liên hệ</div>
            <div>Nội dung Yêu cầu</div>
            <div>Chi tiết bổ sung</div>
            <div>Trạng thái</div>
            <div>Thao tác</div>
          </div>

          {requests.map((request) => {
            const status = request.status as any;
            const displayStatus = 
              status === "pending" || status === "Chờ xử lý" ? "Chờ xử lý" :
              status === "processing" || status === "Đang xử lý" ? "Đang xử lý" :
              status === "matched" || status === "Đã ghép" ? "Đã ghép" :
              status === "cancelled" || status === "Đã hủy" ? "Đã hủy" : 
              "Chờ xử lý";

            const isProcessing = displayStatus === "Đang xử lý";
            const isCompletedOrCancelled = displayStatus === "Đã ghép" || displayStatus === "Đã hủy";

            return (
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

                <div>
                  <div className="font-bold">{request.schedule}</div>
                  <p className="mt-2 line-clamp-2 max-w-[340px] text-muted-foreground">
                    {request.note}
                  </p>
                </div>

                <div>
                  <Badge
                    variant={isProcessing ? "secondary" : "outline"}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${
                      displayStatus === "Chờ xử lý"
                        ? "bg-orange-500 text-white border-orange-500"
                        : displayStatus === "Đã ghép"
                        ? "bg-green-600 text-white border-green-600"
                        : displayStatus === "Đã hủy"
                        ? "bg-slate-500 text-white border-slate-500"
                        : ""
                    }`}
                  >
                    {displayStatus}
                  </Badge>
                </div>

                <div>
                  <Button
                    className="h-8 rounded text-xs"
                    type="button"
                    variant={isCompletedOrCancelled ? "outline" : "default"}
                    onClick={(event) => {
                      event.stopPropagation()
                      onSelectRequest(request)
                    }}
                  >
                    {isCompletedOrCancelled ? "Xem" : "Ghép"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

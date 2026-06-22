import { Clock3, MapPin, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { RequestItem } from "@/types/class_request"

type RequestContactCardProps = {
  request: RequestItem
  onViewSchedule?: () => void
}

export function RequestContactCard({ request, onViewSchedule }: RequestContactCardProps) {
  return (
    <div className="rounded border border-border p-3 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-2.5">
          <h3 className="text-xs font-bold">Thông tin Học viên / Phụ huynh</h3>
          {onViewSchedule && (
            <Button 
              type="button" 
              variant="outline" 
              className="h-6 rounded text-[9px] px-2 border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={onViewSchedule}
            >
              Xem lịch bận
            </Button>
          )}
        </div>
        <dl className="space-y-3 text-[11px]">
          <div className="flex gap-2">
            <UserRound className="mt-0.5 text-muted-foreground" size={12} />
            <div>
              <dt className="text-muted-foreground">Tên liên hệ</dt>
              <dd className="font-bold">
                {request.name} ({request.role})
              </dd>
            </div>
          </div>
          <div className="flex gap-2">
            <Clock3 className="mt-0.5 text-muted-foreground" size={12} />
            <div>
              <dt className="text-muted-foreground">Số điện thoại</dt>
              <dd className="font-bold">{request.phone}</dd>
            </div>
          </div>
          <div className="flex gap-2">
            <MapPin className="mt-0.5 text-muted-foreground" size={12} />
            <div>
              <dt className="text-muted-foreground">Khu vực</dt>
              <dd className="font-bold">{request.area}</dd>
            </div>
          </div>
        </dl>
      </div>
    </div>
  )
}

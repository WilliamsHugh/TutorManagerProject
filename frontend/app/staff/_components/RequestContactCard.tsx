import { Clock3, MapPin, UserRound } from "lucide-react"

import type { RequestItem } from "@/types/class_request"

type RequestContactCardProps = {
  request: RequestItem
}

export function RequestContactCard({ request }: RequestContactCardProps) {
  return (
    <div className="rounded border border-border p-3">
      <h3 className="text-xs font-bold">Thông tin Học viên / Phụ huynh</h3>
      <dl className="mt-3 space-y-3 text-[11px]">
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
  )
}

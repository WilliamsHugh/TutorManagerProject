import { BookOpen, CalendarDays, ListChecks } from "lucide-react"

import type { RequestItem } from "@/types/class_request"

type RequestDetailCardProps = {
  request: RequestItem
}

export function RequestDetailCard({ request }: RequestDetailCardProps) {
  return (
    <div className="rounded border border-border p-3">
      <h3 className="text-xs font-bold">Chi tiết Yêu cầu</h3>
      <dl className="mt-3 space-y-3 text-[11px]">
        <div className="flex gap-2">
          <BookOpen className="mt-0.5 text-muted-foreground" size={12} />
          <div>
            <dt className="text-muted-foreground">Môn học & Cấp độ</dt>
            <dd className="font-bold">
              {request.subject} - {request.level}
            </dd>
          </div>
        </div>
        <div className="flex gap-2">
          <CalendarDays className="mt-0.5 text-muted-foreground" size={12} />
          <div>
            <dt className="text-muted-foreground">Lịch học mong muốn</dt>
            <dd className="font-bold">{request.schedule}</dd>
          </div>
        </div>
        <div className="flex gap-2">
          <ListChecks className="mt-0.5 text-muted-foreground" size={12} />
          <div>
            <dt className="text-muted-foreground">Yêu cầu chi tiết</dt>
            <dd className="font-bold">{request.note}</dd>
          </div>
        </div>
      </dl>
    </div>
  )
}

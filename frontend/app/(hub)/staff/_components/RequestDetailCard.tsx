import { BookOpen, CalendarDays, ListChecks } from "lucide-react"

import type { RequestItem } from "@/types/class_request"

type RequestDetailCardProps = {
  request: RequestItem
}

export function RequestDetailCard({ request }: RequestDetailCardProps) {
  return (
    <div className="rounded border border-border p-3 flex flex-col justify-between">
      <div>
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
        </dl>
      </div>
      
      <div className="mt-3 rounded border border-slate-100 bg-slate-50 p-2.5">
        <div className="flex gap-2">
          <ListChecks className="mt-0.5 text-primary" size={12} />
          <div className="w-full">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Yêu cầu chi tiết</span>
            <p className="mt-1 text-[11px] font-medium text-slate-700 leading-relaxed whitespace-pre-line">
              {request.note || "Không có yêu cầu chi tiết."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

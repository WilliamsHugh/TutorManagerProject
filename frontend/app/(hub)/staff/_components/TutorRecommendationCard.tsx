import Link from "next/link"
import { Mail, Phone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { TutorRecommendation } from "@/types/class_request"

type TutorRecommendationCardProps = {
  actionLabel: string
  href?: string
  tutor: TutorRecommendation
  onViewSchedule?: () => void
}

export function TutorRecommendationCard({
  actionLabel,
  href,
  tutor,
  onViewSchedule,
}: TutorRecommendationCardProps) {
  return (
    <div className="rounded border border-border bg-white p-3 flex flex-col justify-between h-[230px]">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
              {tutor.avatar}
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-bold">{tutor.name}</div>
              <div className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">
                {tutor.meta}
              </div>
            </div>
          </div>
          <Badge
            className={`${tutor.highlight} shrink-0 rounded px-2 py-1 text-[10px] text-white`}
          >
            {tutor.match}
          </Badge>
        </div>

        {/* Thông tin liên hệ */}
        <div className="mt-2.5 space-y-1 rounded bg-slate-50 p-2 text-[10px] text-muted-foreground border border-slate-100">
          <div className="flex items-center gap-1.5">
            <Phone size={10} className="text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-500">SĐT:</span>
            <span className="font-medium text-foreground">{tutor.phone}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Mail size={10} className="text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-500">Email:</span>
            <span className="font-medium text-foreground truncate" title={tutor.email}>
              {tutor.email}
            </span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {tutor.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-[#edf3fb] px-2 py-0.5 text-[9px] font-semibold text-foreground truncate max-w-[110px]"
              title={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <span className="text-[10px] text-muted-foreground font-semibold">
          {tutor.status === "Hồ sơ đã duyệt" ? "✓ Đã duyệt" : "⚠ Cần duyệt"}
        </span>
        <div className="flex gap-1.5">
          {onViewSchedule && (
            <Button 
              type="button" 
              variant="outline" 
              className="h-7 rounded text-[10px] px-2 border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={onViewSchedule}
            >
              Lịch bận
            </Button>
          )}
          {href ? (
            <Button asChild className="h-7 rounded text-[10px] px-2.5">
              <Link href={href}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button disabled className="h-7 rounded text-[10px] px-2.5 bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed">
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

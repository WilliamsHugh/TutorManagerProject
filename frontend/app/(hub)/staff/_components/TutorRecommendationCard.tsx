import Link from "next/link"
import { Mail, Phone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { TutorRecommendation } from "@/types/class_request"

type TutorRecommendationCardProps = {
  actionLabel: string
  href?: string
  tutor: TutorRecommendation
}

export function TutorRecommendationCard({
  actionLabel,
  href,
  tutor,
}: TutorRecommendationCardProps) {
  return (
    <div className="rounded border border-border bg-white p-3">
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

      <div className="mt-3 flex flex-wrap gap-1">
        {tutor.tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-[#edf3fb] px-2 py-1 text-[10px] font-semibold text-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {tutor.status}
        </span>
        {href ? (
          <Button asChild className="h-8 rounded text-xs">
            <Link href={href}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button disabled className="h-8 rounded text-xs bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

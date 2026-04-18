import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { TutorRecommendation } from "./types"

type TutorRecommendationCardProps = {
  actionLabel: string
  tutor: TutorRecommendation
}

export function TutorRecommendationCard({
  actionLabel,
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
        <Button className="h-8 rounded text-xs">{actionLabel}</Button>
      </div>
    </div>
  )
}

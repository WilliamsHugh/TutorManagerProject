import { ChevronDown, X } from "lucide-react"

import { Button } from "@/components/ui/button"

import { RequestContactCard } from "./RequestContactCard"
import { RequestDetailCard } from "./RequestDetailCard"
import { TutorRecommendationCard } from "./TutorRecommendationCard"
import type { RequestItem, TutorRecommendation } from "@/types/class_request"

type MatchTutorDialogProps = {
  request: RequestItem
  tutors: TutorRecommendation[]
  onClose: () => void
}

export function MatchTutorDialog({
  request,
  tutors,
  onClose,
}: MatchTutorDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-7"
      onClick={onClose}
    >
      <section
        aria-modal="true"
        className="max-h-[78vh] w-full max-w-[680px] overflow-y-auto rounded-md bg-white shadow-xl"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-border bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold">
                Đề xuất gia sư cho Yêu cầu {request.id} | {request.subject} -{" "}
                {request.level}
              </h2>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Tập trung vào việc tìm và ghép gia sư phù hợp theo môn học, khu
                vực và lịch rảnh.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button className="h-8 rounded text-xs" variant="outline">
                {request.status}
                <ChevronDown size={12} />
              </Button>
              <button
                aria-label="Đóng"
                className="flex size-8 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                type="button"
                onClick={onClose}
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <RequestContactCard request={request} />
            <RequestDetailCard request={request} />
          </div>

          <div className="rounded border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xs font-bold">Gia sư được đề xuất</h3>
              <div className="flex flex-wrap gap-2">
                <Button className="h-7 rounded text-[11px]" variant="outline">
                  Đã duyệt
                  <ChevronDown size={11} />
                </Button>
                <Button className="h-7 rounded text-[11px]" variant="outline">
                  Toán học
                  <ChevronDown size={11} />
                </Button>
                <Button className="h-7 rounded text-[11px]" variant="outline">
                  Quận 1
                  <ChevronDown size={11} />
                </Button>
                <label className="flex h-7 items-center gap-2 rounded border border-border px-2 text-[11px] font-semibold">
                  <input
                    className="size-3 accent-[var(--primary)]"
                    defaultChecked
                    type="checkbox"
                  />
                  Ưu tiên khớp lịch rảnh
                </label>
                <Button className="h-7 rounded text-[11px]" variant="outline">
                  Làm mới gợi ý
                </Button>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {tutors.map((tutor, index) => (
                <TutorRecommendationCard
                  key={tutor.name}
                  actionLabel={index === 0 ? "Đề xuất" : "Ghép lớp"}
                  tutor={tutor}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

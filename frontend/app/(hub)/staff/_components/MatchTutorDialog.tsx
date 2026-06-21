"use client"

import { ChevronDown, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

import { RequestContactCard } from "./RequestContactCard"
import { RequestDetailCard } from "./RequestDetailCard"
import { TutorRecommendationCard } from "./TutorRecommendationCard"
import type { RequestItem, RequestStatus, TutorRecommendation } from "@/types/class_request"

const statusOptions: RequestStatus[] = ["Chờ xử lý", "Đang xử lý", "Đã ghép", "Đã hủy"]

type MatchTutorDialogProps = {
  request: RequestItem
  tutors: TutorRecommendation[]
  loadingTutors?: boolean
  onRefreshTutors?: () => void
  onStatusChange?: (status: RequestStatus) => Promise<void>
  onClose: () => void
}

export function MatchTutorDialog({
  request,
  tutors,
  loadingTutors = false,
  onRefreshTutors,
  onStatusChange,
  onClose,
}: MatchTutorDialogProps) {
  const [status, setStatus] = useState<RequestStatus>(request.status)
  const [savingStatus, setSavingStatus] = useState(false)

  async function handleStatusChange(value: RequestStatus) {
    setStatus(value)
    if (!onStatusChange) return

    setSavingStatus(true)
    try {
      await onStatusChange(value)
    } finally {
      setSavingStatus(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-7"
      onClick={onClose}
    >
      <section
        aria-modal="true"
        className="max-h-[85vh] w-full max-w-170 rounded-md bg-white shadow-xl flex flex-col"
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
              <label className="relative">
                <span className="sr-only">Trạng thái yêu cầu</span>
                <select
                  className="h-8 appearance-none rounded border border-border bg-white pl-3 pr-8 text-xs font-semibold outline-none transition-colors hover:bg-muted focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={savingStatus || request.status === "Đã ghép" || request.status === "Đã hủy"}
                  value={status}
                  onChange={(event) => handleStatusChange(event.target.value as RequestStatus)}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={12}
                />
              </label>
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
          {(status === "Đã ghép" || status === "Đã hủy") && (
            <div className={`rounded-lg p-3.5 text-xs font-semibold border ${
              status === "Đã ghép" 
                ? "bg-green-50 text-green-700 border-green-200" 
                : "bg-slate-50 text-slate-700 border-slate-200"
            }`}>
              {status === "Đã ghép" 
                ? "✓ Yêu cầu này đã được ghép lớp thành công. Không thể ghép thêm gia sư khác."
                : "✕ Yêu cầu này đã bị hủy. Không thể thực hiện ghép gia sư."}
            </div>
          )}

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
                  {request.subject}
                  <ChevronDown size={11} />
                </Button>
                <Button className="h-7 rounded text-[11px]" variant="outline">
                  {request.area}
                  <ChevronDown size={11} />
                </Button>
                <label className="flex h-7 items-center gap-2 rounded border border-border px-2 text-[11px] font-semibold">
                  <input
                    className="size-3 accent-primary"
                    defaultChecked
                    type="checkbox"
                  />
                  Ưu tiên khớp lịch rảnh
                </label>
                <Button
                  className="h-7 rounded text-[11px]"
                  type="button"
                  variant="outline"
                  onClick={onRefreshTutors}
                >
                  Làm mới gợi ý
                </Button>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2 overflow-y-auto max-h-[350px] pr-1.5 py-0.5">
              {loadingTutors ? (
                <>
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="rounded border border-border bg-white p-3 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 gap-3 w-full">
                          <div className="size-9 shrink-0 rounded-full bg-muted animate-pulse" />
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="h-5 w-14 bg-muted rounded animate-pulse shrink-0" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-14 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-3.5 w-16 bg-muted rounded animate-pulse" />
                        <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </>
              ) : tutors.length ? (
                tutors.map((tutor) => {
                  const isMatched = status === "Đã ghép"
                  const isCancelled = status === "Đã hủy"
                  const actionLabel = isMatched ? "Đã ghép" : isCancelled ? "Bị hủy" : "Ghép lớp"
                  const href = (isMatched || isCancelled)
                    ? undefined
                    : `/staff/request-management/create-class?requestId=${encodeURIComponent(
                        request.rawId
                      )}&tutorId=${encodeURIComponent(tutor.rawTutorId)}&tutorName=${encodeURIComponent(
                        tutor.name
                      )}`
                  return (
                    <TutorRecommendationCard
                      key={tutor.rawTutorId}
                      actionLabel={actionLabel}
                      href={href}
                      tutor={tutor}
                    />
                  )
                })
              ) : (
                <div className="col-span-full rounded border border-dashed border-border p-4 text-xs text-muted-foreground">
                  Chưa có gia sư phù hợp theo dữ liệu hiện tại.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

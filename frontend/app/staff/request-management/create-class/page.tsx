"use client"

import { CalendarDays } from "lucide-react"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClass, getClassRequest } from "@/lib/staff-api"
import type { RequestItem } from "@/types/class_request"
import { mapClassRequest } from "@/types/staff"

import { requests as mockRequests } from "../../../hub/components/data"
import { StaffShell } from "../../../hub/components/StaffShell"

type ClassForm = {
  location: string
  feePerSession: string
  totalSessions: string
  startDate: string
  endDate: string
  notes: string
}

export default function CreateClassPage() {
  return (
    <Suspense fallback={<CreateClassLoading />}>
      <CreateClassContent />
    </Suspense>
  )
}

function CreateClassContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get("requestId")
  const tutorId = searchParams.get("tutorId")
  const tutorName = searchParams.get("tutorName") ?? "Gia sư đã chọn"

  const [request, setRequest] = useState<RequestItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ClassForm>({
    location: "",
    feePerSession: "200000",
    totalSessions: "24",
    startDate: "",
    endDate: "",
    notes: "",
  })

  const classCode = useMemo(() => {
    if (!requestId) return "CLASS-NEW"
    return `CLASS-${requestId.replace(/-/g, "").slice(0, 6).toUpperCase()}`
  }, [requestId])

  useEffect(() => {
    async function loadRequest() {
      if (!requestId) {
        setError("Thiếu mã yêu cầu để tạo lớp")
        setLoading(false)
        return
      }

      try {
        const data = await getClassRequest(requestId)
        const mapped = mapClassRequest(data)
        setRequest(mapped)
        setForm((current) => ({ ...current, location: mapped.area }))
      } catch (err) {
        const fallback = mockRequests.find((item) => item.rawId === requestId || item.id === requestId)
        if (fallback) {
          setRequest(fallback)
          setForm((current) => ({ ...current, location: fallback.area }))
          setError("Đang xem bằng dữ liệu mẫu vì chưa đăng nhập hoặc API chưa sẵn sàng.")
        } else {
          setError(err instanceof Error ? err.message : "Không thể tải thông tin yêu cầu")
        }
      } finally {
        setLoading(false)
      }
    }

    loadRequest()
  }, [requestId])

  function updateField(field: keyof ClassForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!requestId || !tutorId) {
      setError("Thiếu thông tin yêu cầu hoặc gia sư để tạo lớp")
      return
    }

    setSaving(true)
    setError(null)
    try {
      await createClass({
        requestId,
        tutorId,
        location: form.location,
        feePerSession: form.feePerSession,
        totalSessions: form.totalSessions,
        startDate: form.startDate,
        endDate: form.endDate,
        notes: form.notes,
      })
      router.push("/staff/classes")
    } catch (err) {
      setError("Đây là chế độ xem tạm không xác thực, nên thao tác tạo lớp chưa lưu vào DB.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <CreateClassLoading />

  return (
    <StaffShell current="Tạo lớp học">
      <section className="mx-auto w-full max-w-[820px]">
        <Card className="rounded-xl border-border shadow-none">
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight">
                  Tạo Lớp Học Mới
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    Dựa trên yêu cầu ghép lớp {request?.id ?? "chưa xác định"}
                  </p>
                  <Badge className="gap-2 rounded-full bg-green-100 px-3 py-0.5 text-[11px] text-green-700 hover:bg-green-100">
                    <span className="size-2 rounded-full bg-current" />
                    Đã chọn gia sư
                  </Badge>
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <FormSection
                description="Nhóm dữ liệu chỉ đọc để đảm bảo tính toàn vẹn khi tạo lớp học."
                title="Thông tin trích xuất từ Yêu cầu"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <ReadonlyField label="Học viên" value={request?.name ?? "Chưa cập nhật"} />
                  <ReadonlyField label="Gia sư phụ trách" value={tutorName} />
                  <ReadonlyField label="Mã lớp học" value={classCode} />
                  <ReadonlyField
                    label="Môn học"
                    value={request ? `${request.subject} - ${request.level}` : "Chưa cập nhật"}
                  />
                </div>
              </FormSection>

              <FormSection
                description="Hoàn thiện các thông tin vận hành lớp trước khi xác nhận tạo mới."
                title="Thông tin Nhân viên thiết lập"
              >
                <div className="grid gap-3">
                  <EditableField
                    label="Địa điểm dạy"
                    value={form.location}
                    onChange={(value) => updateField("location", value)}
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <EditableField
                    inputMode="numeric"
                    label="Học phí mỗi buổi"
                    value={form.feePerSession}
                    onChange={(value) => updateField("feePerSession", value)}
                  />
                  <EditableField
                    inputMode="numeric"
                    label="Tổng số buổi"
                    value={form.totalSessions}
                    onChange={(value) => updateField("totalSessions", value)}
                  />
                  <DateField
                    label="Ngày bắt đầu"
                    value={form.startDate}
                    onChange={(value) => updateField("startDate", value)}
                  />
                  <DateField
                    label="Ngày kết thúc dự kiến"
                    value={form.endDate}
                    onChange={(value) => updateField("endDate", value)}
                  />
                </div>

                <EditableField
                  label="Ghi chú vận hành"
                  value={form.notes}
                  onChange={(value) => updateField("notes", value)}
                />
              </FormSection>

              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  className="h-9 rounded-md px-4"
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/staff/request-management")}
                >
                  Hủy bỏ
                </Button>
                <Button className="h-9 rounded-md px-4" disabled={saving} type="submit">
                  {saving ? "Đang tạo lớp..." : "Xác nhận & Tạo lớp"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </StaffShell>
  )
}

function CreateClassLoading() {
  return (
    <StaffShell current="Tạo lớp học">
      <section className="mx-auto w-full max-w-[820px]">
        <Card className="rounded-xl border-border shadow-none">
          <CardContent className="p-5">
            <div className="h-7 w-56 rounded bg-muted" />
            <div className="mt-3 h-4 w-80 rounded bg-muted" />
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="h-3.5 w-28 rounded bg-muted" />
                  <div className="h-9 rounded-md bg-input" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </StaffShell>
  )
}

type FormSectionProps = {
  children: React.ReactNode
  description: string
  title: string
}

function FormSection({ children, description, title }: FormSectionProps) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-base font-bold">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

type FieldProps = {
  label: string
  value: string
}

function ReadonlyField({ label, value }: FieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold">{label}</span>
      <Input
        className="h-9 rounded-md bg-input text-sm font-medium text-muted-foreground opacity-100"
        disabled
        value={value}
      />
    </label>
  )
}

type EditableFieldProps = FieldProps & {
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  onChange: (value: string) => void
}

function EditableField({ inputMode, label, value, onChange }: EditableFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold">{label}</span>
      <Input
        className="h-9 rounded-md bg-white text-sm font-medium"
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

type DateFieldProps = EditableFieldProps

function DateField({ label, value, onChange }: DateFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold">{label}</span>
      <div className="relative">
        <Input
          className="h-9 rounded-md bg-white pr-10 text-sm font-medium"
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <CalendarDays
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={16}
        />
      </div>
    </label>
  )
}

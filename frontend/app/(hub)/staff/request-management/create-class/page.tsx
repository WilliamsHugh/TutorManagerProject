"use client"

import { CalendarDays, UploadCloud, File, Trash2, Eye } from "lucide-react"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClass, getClassRequest } from "@/lib/api"
import type { RequestItem } from "@/types/class_request"
import { mapClassRequest } from "@/types/staff"

import { StaffShell } from "../../_components/StaffShell"

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

  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; url: string; type: string; size: string }>>([])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = event.target.files
    if (!selectedFiles) return

    const newFiles = Array.from(selectedFiles).map((file) => {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2)
      return {
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: `${sizeMb} MB`,
      }
    })

    setAttachedFiles((prev) => [...prev, ...newFiles])
  }

  function removeFile(index: number) {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const todayStr = useMemo(() => {
    return new Date().toISOString().split("T")[0]
  }, [])

  const classCode = useMemo(() => {
    if (!requestId) return "CLASS-NEW"
    return `CLASS-${requestId.replace(/-/g, "").slice(0, 6).toUpperCase()}`
  }, [requestId])

  // Load draft from localStorage on mount/change
  useEffect(() => {
    if (typeof window !== "undefined" && requestId && tutorId) {
      const saved = localStorage.getItem(`create_class_draft_${requestId}_${tutorId}`)
      if (saved) {
        try {
          setForm(JSON.parse(saved))
        } catch (e) {
          // ignore
        }
      }
    }
  }, [requestId, tutorId])

  // Save draft to localStorage on form changes
  useEffect(() => {
    if (typeof window !== "undefined" && requestId && tutorId && (form.location || form.startDate || form.notes)) {
      localStorage.setItem(`create_class_draft_${requestId}_${tutorId}`, JSON.stringify(form))
    }
  }, [form, requestId, tutorId])

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
        setForm((current) => {
          if (current.location) return current // keep localStorage location if exists
          return { ...current, location: mapped.area }
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải thông tin yêu cầu")
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
    setError(null)

    if (!requestId || !tutorId) {
      setError("Thiếu thông tin yêu cầu hoặc gia sư để tạo lớp")
      return
    }

    // 1. Check for empty fields
    if (!form.location.trim()) {
      setError("Vui lòng nhập địa điểm dạy học")
      return
    }
    if (!form.feePerSession.trim()) {
      setError("Vui lòng nhập học phí mỗi buổi")
      return
    }
    if (!form.totalSessions.trim()) {
      setError("Vui lòng nhập tổng số buổi học")
      return
    }
    if (!form.startDate.trim()) {
      setError("Vui lòng chọn ngày bắt đầu")
      return
    }
    if (!form.endDate.trim()) {
      setError("Vui lòng chọn ngày kết thúc dự kiến")
      return
    }

    // 2. Validate numeric values
    const fee = Number(form.feePerSession)
    if (isNaN(fee) || fee <= 0) {
      setError("Học phí mỗi buổi phải là một số dương hợp lệ")
      return
    }

    const sessions = Number(form.totalSessions)
    if (isNaN(sessions) || !Number.isInteger(sessions) || sessions <= 0) {
      setError("Tổng số buổi học phải là một số nguyên dương hợp lệ")
      return
    }

    // 3. Validate dates (prevent past dates and verify range)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const start = new Date(form.startDate)
    if (isNaN(start.getTime())) {
      setError("Ngày bắt đầu không hợp lệ")
      return
    }
    if (start < today) {
      setError("Ngày bắt đầu không được ở trong quá khứ")
      return
    }

    const end = new Date(form.endDate)
    if (isNaN(end.getTime())) {
      setError("Ngày kết thúc dự kiến không hợp lệ")
      return
    }
    if (end <= start) {
      setError("Ngày kết thúc dự kiến phải sau ngày bắt đầu")
      return
    }

    setSaving(true)
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
      if (typeof window !== "undefined") {
        localStorage.removeItem(`create_class_draft_${requestId}_${tutorId}`)
      }
      router.push("/staff/classes")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo lớp học lúc này. Vui lòng kiểm tra lại thông tin.")
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
                    min={todayStr}
                    value={form.startDate}
                    onChange={(value) => updateField("startDate", value)}
                  />
                  <DateField
                    label="Ngày kết thúc dự kiến"
                    min={form.startDate || todayStr}
                    value={form.endDate}
                    onChange={(value) => updateField("endDate", value)}
                  />
                </div>

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold">Ghi chú vận hành</span>
                  <textarea
                    className="flex min-h-24 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50 font-medium resize-y"
                    value={form.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    placeholder="Nhập thông tin chi tiết và ghi chú vận hành lớp học..."
                  />
                </label>

                {/* Upload File Section */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-semibold block">Tài liệu đính kèm (File)</span>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-white hover:bg-secondary/40 hover:border-primary/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-xs font-bold text-foreground">Click để tải lên tài liệu</p>
                        <p className="text-[10px] text-muted-foreground">PDF, PNG, JPG, DOCX (Tối đa 10MB)</p>
                      </div>
                      <input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        onChange={handleFileChange} 
                      />
                    </label>
                  </div>

                  {attachedFiles.length > 0 && (
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 mt-2">
                      {attachedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 border border-border rounded-lg bg-card text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            {file.type.startsWith("image/") ? (
                              <img src={file.url} alt={file.name} className="w-8 h-8 object-cover rounded" />
                            ) : (
                              <File className="w-8 h-8 text-primary shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold truncate max-w-[150px]">{file.name}</p>
                              <p className="text-[10px] text-muted-foreground">{file.size}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                              title="Xem tệp"
                            >
                              <Eye size={14} />
                            </a>
                            <button 
                              type="button" 
                              onClick={() => removeFile(idx)}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                              title="Xóa tệp"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
      <section className="mx-auto w-full max-w-[820px] animate-pulse">
        <Card className="rounded-xl border-border shadow-none">
          <CardContent className="p-5">
            <div className="h-7 w-56 rounded bg-muted animate-pulse" />
            <div className="mt-3 h-4 w-80 rounded bg-muted animate-pulse" />
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="h-3.5 w-28 rounded bg-muted animate-pulse" />
                  <div className="h-9 rounded-md bg-muted animate-pulse" />
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

type DateFieldProps = EditableFieldProps & {
  min?: string
}

function DateField({ label, value, onChange, min }: DateFieldProps) {
  // Format YYYY-MM-DD display representation into DD/MM/YYYY
  const displayValue = value ? (() => {
    const parts = value.split("-")
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return value
  })() : ""

  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-foreground/80">{label}</span>
      <div className="relative group cursor-pointer">
        {/* Formatted Date Overlay - enforces dd/mm/yyyy display regardless of browser language */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-sm font-medium text-foreground z-10">
          {displayValue || <span className="text-muted-foreground">dd/mm/yyyy</span>}
        </div>
        <input
          type="date"
          min={min}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onClick={(event) => {
            try {
              (event.target as any).showPicker()
            } catch (e) {
              // fallback
            }
          }}
          onFocus={(event) => {
            try {
              (event.target as any).showPicker()
            } catch (e) {
              // fallback
            }
          }}
          className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 pr-10 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50 font-medium cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-datetime-edit]:opacity-0 [&::-webkit-datetime-edit-fields-wrapper]:opacity-0 select-none"
          style={{
            colorScheme: "light"
          }}
        />
        <CalendarDays
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary group-hover:text-primary transition-colors z-20"
          size={16}
        />
      </div>
    </label>
  )
}

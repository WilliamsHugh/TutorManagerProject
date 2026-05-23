import type {
  ApiClassRequest,
  ApiRequestStatus,
  ApiStudent,
  ApiSubject,
  ApiTutorRecommendation,
  ApiUser,
  RequestItem,
  RequestStatus,
  TutorRecommendation,
} from "./class_request"

export type ApiClassStatus = "active" | "completed" | "cancelled" | "suspended"
export type ClassStatusLabel = "Đang học" | "Hoàn thành" | "Đã hủy" | "Tạm dừng"

export type ApiTutor = {
  id: string
  user?: ApiUser
  educationLevel?: string | null
  major?: string | null
  experience?: string | null
  availableAreas?: string | null
}

export type ApiClass = {
  id: string
  tutor?: ApiTutor
  student?: ApiStudent
  subject?: ApiSubject
  request?: ApiClassRequest
  createdBy?: ApiUser | null
  location?: string | null
  feePerSession?: string | number | null
  totalSessions?: number | null
  status: ApiClassStatus
  startDate?: string | null
  endDate?: string | null
  notes?: string | null
}

export type StaffClassItem = {
  id: string
  code: string
  studentName: string
  tutorName: string
  subject: string
  location: string
  feePerSession: string
  totalSessions: string
  status: ClassStatusLabel
  startDate: string
  endDate: string
}

export const requestStatusLabels: Record<ApiRequestStatus, RequestStatus> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  matched: "Đã ghép",
  cancelled: "Đã hủy",
}

export const requestStatusValues: Record<RequestStatus, ApiRequestStatus> = {
  "Chờ xử lý": "pending",
  "Đang xử lý": "processing",
  "Đã ghép": "matched",
  "Đã hủy": "cancelled",
}

export const classStatusLabels: Record<ApiClassStatus, ClassStatusLabel> = {
  active: "Đang học",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  suspended: "Tạm dừng",
}

function formatDate(value?: string | null) {
  if (!value) return "Chưa cập nhật"
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value))
}

function compactCode(id: string, prefix: string) {
  return `${prefix}-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(-2)
    .toUpperCase()
}

export function mapClassRequest(request: ApiClassRequest): RequestItem {
  const user = request.student?.user
  return {
    id: compactCode(request.id, "RQ"),
    rawId: request.id,
    createdAt: formatDate(request.createdAt),
    name: user?.fullName ?? "Chưa có tên",
    role: request.student?.parentName ? "Phụ huynh" : "Học viên",
    phone: user?.phone ?? request.student?.parentPhone ?? "Chưa cập nhật",
    subject: request.subject?.name ?? "Chưa chọn môn",
    level: request.subject?.gradeLevel ?? request.student?.gradeLevel ?? "Chưa cập nhật",
    area: request.preferredArea ?? "Chưa cập nhật",
    schedule: request.preferredSchedule ?? "Chưa cập nhật",
    note: request.requirements ?? "Không có yêu cầu đặc biệt",
    status: requestStatusLabels[request.status],
  }
}

export function mapTutorRecommendation(item: ApiTutorRecommendation): TutorRecommendation {
  const name = item.tutor.user?.fullName ?? "Gia sư chưa cập nhật"
  const major = item.tutor.major ?? item.tutor.educationLevel ?? "Hồ sơ gia sư"
  const years = item.yearsExperience ? `${item.yearsExperience} năm kinh nghiệm` : "Chưa cập nhật kinh nghiệm"

  return {
    id: item.tutor.id,
    rawTutorId: item.tutor.id,
    name,
    meta: `${years} · ${major}`,
    match: `${Math.round(item.score)}% Match`,
    avatar: initials(name),
    tags: [
      item.subject?.name ?? "Đúng môn",
      item.proficiencyLevel ?? "Đã duyệt",
      item.tutor.availableAreas ?? "Chưa cập nhật khu vực",
      item.areaMatched ? "Khớp khu vực" : "Cần kiểm tra khu vực",
    ],
    status: item.tutor.approvalStatus === "approved" ? "Hồ sơ đã duyệt" : "Cần kiểm tra hồ sơ",
    highlight: item.score >= 90 ? "bg-green-600" : item.score >= 80 ? "bg-orange-500" : "bg-slate-500",
  }
}

export function mapStaffClass(item: ApiClass): StaffClassItem {
  return {
    id: item.id,
    code: compactCode(item.id, "CLASS"),
    studentName: item.student?.user?.fullName ?? "Chưa có học viên",
    tutorName: item.tutor?.user?.fullName ?? "Chưa có gia sư",
    subject: item.subject?.name ?? "Chưa có môn",
    location: item.location ?? "Chưa cập nhật",
    feePerSession: item.feePerSession
      ? Number(item.feePerSession).toLocaleString("vi-VN")
      : "Chưa cập nhật",
    totalSessions: item.totalSessions ? `${item.totalSessions} buổi` : "Chưa cập nhật",
    status: classStatusLabels[item.status],
    startDate: formatDate(item.startDate),
    endDate: formatDate(item.endDate),
  }
}

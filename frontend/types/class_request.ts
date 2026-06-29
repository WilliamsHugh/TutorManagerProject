export type ApiRequestStatus = "pending" | "processing" | "matched" | "cancelled"
export type RequestStatus = "Chờ xử lý" | "Đang xử lý" | "Đã ghép" | "Đã hủy"

export type ApiUser = {
  id: string
  fullName?: string
  email?: string
  phone?: string | null
}

export type ApiStudent = {
  id: string
  gradeLevel?: string | null
  schoolName?: string | null
  parentName?: string | null
  parentPhone?: string | null
  parentEmail?: string | null
  user?: ApiUser
}

export type ApiSubject = {
  id: string
  name: string
  gradeLevel?: string | null
}

export type ApiClassRequest = {
  id: string
  createdAt: string
  updatedAt?: string
  preferredArea?: string | null
  preferredSchedule?: string | null
  requirements?: string | null
  status: ApiRequestStatus
  student?: ApiStudent
  subject?: ApiSubject
  handledBy?: ApiUser | null
  proposedFee?: number | null
  proposedSessions?: number | null
  preferredTutor?: {
    id: string
    educationLevel?: string | null
    major?: string | null
    experience?: string | null
    availableAreas?: string | null
    bio?: string | null
    university?: string | null
    user?: ApiUser
  } | null
}

export type RequestItem = {
  id: string
  rawId: string
  createdAt: string
  name: string
  role: string
  phone: string
  subject: string
  level: string
  area: string
  schedule: string
  note: string
  status: RequestStatus
  studentId?: string
  proposedFee?: number
  proposedSessions?: number
  preferredTutor?: {
    id: string
    name: string
    educationLevel: string
    major: string
    experience: string
    availableAreas: string
    bio: string
    university: string
    phone: string
    email: string
  } | null
}

export type ApiTutorRecommendation = {
  tutor: {
    id: string
    approvalStatus?: string
    availableAreas?: string | null
    educationLevel?: string | null
    major?: string | null
    experience?: string | null
    user?: ApiUser
  }
  subject?: ApiSubject
  proficiencyLevel?: string | null
  yearsExperience?: number | null
  score: number
  areaMatched: boolean
}

export type TutorRecommendation = {
  id: string
  rawTutorId: string
  name: string
  meta: string
  match: string
  avatar: string
  tags: string[]
  status: string
  highlight: string
  phone?: string
  email?: string
}

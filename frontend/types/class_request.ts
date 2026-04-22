export type RequestStatus = "Chờ xử lý" | "Đang xử lý" | "Đã ghép"

export type RequestItem = {
  id: string
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
}

export type TutorRecommendation = {
  name: string
  meta: string
  match: string
  avatar: string
  tags: string[]
  status: string
  highlight: string
}

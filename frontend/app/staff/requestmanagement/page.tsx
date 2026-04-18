"use client"

import { useMemo, useState } from "react"
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Clock3,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Search,
  UserRound,
  UsersRound,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type RequestStatus = "Chờ xử lý" | "Đang xử lý" | "Đã ghép"

type RequestItem = {
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

const requests: RequestItem[] = [
  {
    id: "#RQ-10293",
    createdAt: "12/10/2023",
    name: "Lê Trọng Tấn",
    role: "Phụ huynh",
    phone: "0901 234 567",
    subject: "Toán học",
    level: "Lớp 10",
    area: "Quận 1, TP.HCM",
    schedule: "Tối Thứ 2, Thứ 4 · 19:00 - 21:00",
    note: "Ưu tiên gia sư ĐH Bách Khoa hoặc KHTN, có kinh nghiệm dạy kèm cấp 3.",
    status: "Chờ xử lý",
  },
  {
    id: "#RQ-10294",
    createdAt: "13/10/2023",
    name: "Ngô Minh An",
    role: "Học viên",
    phone: "0935 451 882",
    subject: "Tiếng Anh",
    level: "IELTS Foundation",
    area: "Thủ Đức, TP.HCM",
    schedule: "Sáng Thứ 7, Chủ nhật · 08:00 - 10:00",
    note: "Cần gia sư thiện về phát âm, giao tiếp, có giáo trình nền tảng phù hợp cho học viên mới.",
    status: "Đang xử lý",
  },
  {
    id: "#RQ-10295",
    createdAt: "13/10/2023",
    name: "Trần Mỹ Duyên",
    role: "Phụ huynh",
    phone: "0918 877 520",
    subject: "Vật lý",
    level: "Lớp 11",
    area: "Quận 7, TP.HCM",
    schedule: "Chiều Thứ 3, Thứ 5 · 17:30 - 19:30",
    note: "Ưu tiên gia sư có kinh nghiệm luyện học sinh khá giỏi, bổ trợ thêm bài tập nâng cao.",
    status: "Đã ghép",
  },
  {
    id: "#RQ-10296",
    createdAt: "14/10/2023",
    name: "Phạm Hữu Đức",
    role: "Học viên",
    phone: "0982 612 008",
    subject: "Ngữ văn",
    level: "Lớp 9",
    area: "Bình Thạnh, TP.HCM",
    schedule: "Tối Thứ 6, Chủ nhật · 18:30 - 20:00",
    note: "Cần gia sư theo sát kỹ năng viết đoạn văn nghị luận và củng cố phần đọc hiểu.",
    status: "Đang xử lý",
  },
  {
    id: "#RQ-10297",
    createdAt: "15/10/2023",
    name: "Hoàng Gia Bảo",
    role: "Phụ huynh",
    phone: "0907 225 114",
    subject: "Hóa học",
    level: "Lớp 12",
    area: "Phú Nhuận, TP.HCM",
    schedule: "Tối Thứ 3, Thứ 6 · 19:30 - 21:00",
    note: "Tập trung ôn thi tốt nghiệp, cần gia sư có lộ trình bài tập rõ ràng theo tuần.",
    status: "Chờ xử lý",
  },
]

const tutors = [
  {
    name: "Nguyễn Văn Bình",
    meta: "2 năm kinh nghiệm · Sinh viên ĐH Bách Khoa",
    match: "95% Match",
    avatar: "NV",
    tags: ["Toán", "Vật lý", "Quận 1, Quận 5", "Khớp 2/2 buổi"],
    status: "Hồ sơ đã duyệt",
    highlight: "bg-green-600",
  },
  {
    name: "Trần Thị Cẩm",
    meta: "5 năm kinh nghiệm · Giáo viên THPT",
    match: "85% Match",
    avatar: "TC",
    tags: ["Toán", "Hóa học", "Quận 1, Quận 4, Quận 7", "Khớp 1/2 buổi"],
    status: "Hồ sơ đã duyệt",
    highlight: "bg-orange-500",
  },
  {
    name: "Lê Minh Đạt",
    meta: "1.5 năm kinh nghiệm · ĐH Khoa Học Tự Nhiên",
    match: "92% Match",
    avatar: "LĐ",
    tags: ["Toán", "Tin học", "Quận 3, Quận 10", "Khớp lịch rảnh"],
    status: "Đang nhận lớp",
    highlight: "bg-green-600",
  },
  {
    name: "Phan Ngọc Hà",
    meta: "3 năm kinh nghiệm · Cử nhân Sư phạm Toán",
    match: "90% Match",
    avatar: "PH",
    tags: ["Toán", "Ôn thi", "Bình Thạnh", "Khớp 2/2 buổi"],
    status: "Có thể dạy thử",
    highlight: "bg-green-600",
  },
]

const navItems = [
  { label: "Tổng quan", icon: LayoutDashboard },
  { label: "Quản lý Yêu cầu", icon: FileText, active: true },
  { label: "Quản lý Gia sư", icon: UsersRound },
  { label: "Quản lý Học viên", icon: UserRound },
  { label: "Quản lý Lớp học", icon: BookOpen },
  { label: "Báo cáo thống kê", icon: Clock3 },
]

const getStatusClasses = (status: RequestStatus) => {
  switch (status) {
    case "Chờ xử lý":
      return "bg-orange-500 text-white border-orange-500"
    case "Đang xử lý":
      return "bg-secondary text-secondary-foreground border-secondary"
    case "Đã ghép":
      return "bg-green-600 text-white border-green-600"
  }
}

export default function RequestList() {
  const [search, setSearch] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(
    null
  )

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return requests
    }

    return requests.filter((request) =>
      [
        request.id,
        request.name,
        request.phone,
        request.subject,
        request.level,
        request.area,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    )
  }, [search])

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-foreground">
      <div className="flex min-h-screen">
        <aside className="w-[200px] shrink-0 border-r border-border bg-white">
          <div className="flex h-12 items-center gap-3 border-b border-border px-5">
            <div className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <GraduationCap size={14} />
            </div>
            <span className="text-base font-bold">TutorEdu</span>
          </div>

          <nav className="space-y-1 px-3 py-5">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.label}
                  className={`flex h-9 w-full items-center gap-3 rounded px-3 text-left text-xs font-semibold transition-colors ${
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                  type="button"
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-12 items-center justify-between border-b border-border bg-white px-5">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-muted-foreground">Quản lý Yêu cầu</span>
              <span className="text-muted-foreground">›</span>
              <span>Danh sách</span>
            </div>
            <div className="flex items-center gap-5">
              <Bell className="text-muted-foreground" size={15} />
              <div className="size-7 rounded-full bg-[linear-gradient(135deg,#0b63d6,#ffb020)]" />
            </div>
          </header>

          <main className="p-5">
            <Card className="rounded-md border-border shadow-none">
              <CardContent className="space-y-4 p-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    Quản lý Yêu cầu
                  </h1>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Danh sách chi tiết các yêu cầu tìm gia sư để nhân viên duyệt
                    nhanh thông tin và mở dialog ghép gia sư.
                  </p>
                </div>

                <div className="flex max-w-[620px] gap-2">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={14}
                    />
                    <Input
                      className="h-8 rounded pl-9 text-xs"
                      placeholder="Tìm theo mã YC, SĐT phụ huynh hoặc học viên..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>
                  <Button className="h-8 rounded text-xs" variant="outline">
                    Tất cả trạng thái
                    <ChevronDown size={13} />
                  </Button>
                </div>

                <div className="overflow-hidden rounded border border-border">
                  <div className="max-h-[365px] overflow-auto">
                    <div className="min-w-[960px]">
                      <div className="grid grid-cols-[120px_170px_170px_1fr_100px_90px] bg-[#e9eff7] px-3 py-2 text-[11px] font-bold text-muted-foreground">
                        <div>Mã YC & Ngày tạo</div>
                        <div>Thông tin liên hệ</div>
                        <div>Nội dung Yêu cầu</div>
                        <div>Chi tiết bổ sung</div>
                        <div>Trạng thái</div>
                        <div>Thao tác</div>
                      </div>

                      {filteredRequests.map((request) => (
                        <div
                          key={request.id}
                          className="grid cursor-pointer grid-cols-[120px_170px_170px_1fr_100px_90px] items-center border-t border-border bg-white px-3 py-3 text-xs transition-colors hover:bg-secondary/60"
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedRequest(request)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              setSelectedRequest(request)
                            }
                          }}
                        >
                          <div>
                            <div className="text-base font-bold">
                              {request.id}
                            </div>
                            <div className="mt-2 text-muted-foreground">
                              Tạo lúc {request.createdAt}
                            </div>
                          </div>

                          <div>
                            <div className="font-bold">{request.name}</div>
                            <div className="mt-1 text-muted-foreground">
                              {request.role}
                            </div>
                            <div className="mt-2 font-bold">{request.phone}</div>
                          </div>

                          <div>
                            <div className="font-bold">{request.subject}</div>
                            <div className="mt-1 text-muted-foreground">
                              {request.level}
                            </div>
                            <div className="mt-2 text-muted-foreground">
                              {request.area}
                            </div>
                          </div>

                          <div className="pr-6">
                            <div className="font-bold">{request.schedule}</div>
                            <p className="mt-2 line-clamp-2 max-w-[340px] text-muted-foreground">
                              {request.note}
                            </p>
                          </div>

                          <div>
                            <Badge
                              className={`rounded-md px-2.5 py-1 text-[11px] ${getStatusClasses(
                                request.status
                              )}`}
                            >
                              {request.status}
                            </Badge>
                          </div>

                          <div>
                            <Button
                              className="h-8 rounded text-xs"
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedRequest(request)
                              }}
                            >
                              Ghép
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Hiển thị 1-{filteredRequests.length} trong {requests.length}{" "}
                    yêu cầu
                  </span>
                  <div className="flex gap-2">
                    <Button className="h-7 rounded text-xs" variant="outline">
                      Trước
                    </Button>
                    <Button className="h-7 rounded px-3 text-xs">1</Button>
                    <Button className="h-7 rounded px-3 text-xs" variant="outline">
                      2
                    </Button>
                    <Button className="h-7 rounded text-xs" variant="outline">
                      Sau
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {selectedRequest ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-7"
          onClick={() => setSelectedRequest(null)}
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
                    Đề xuất gia sư cho Yêu cầu {selectedRequest.id} |{" "}
                    {selectedRequest.subject} - {selectedRequest.level}
                  </h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Tập trung vào việc tìm và ghép gia sư phù hợp theo môn học,
                    khu vực và lịch rảnh.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button className="h-8 rounded text-xs" variant="outline">
                    {selectedRequest.status}
                    <ChevronDown size={12} />
                  </Button>
                  <button
                    aria-label="Đóng"
                    className="flex size-8 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-5">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded border border-border p-3">
                  <h3 className="text-xs font-bold">
                    Thông tin Học viên / Phụ huynh
                  </h3>
                  <dl className="mt-3 space-y-3 text-[11px]">
                    <div className="flex gap-2">
                      <UserRound
                        className="mt-0.5 text-muted-foreground"
                        size={12}
                      />
                      <div>
                        <dt className="text-muted-foreground">Tên liên hệ</dt>
                        <dd className="font-bold">
                          {selectedRequest.name} ({selectedRequest.role})
                        </dd>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Clock3 className="mt-0.5 text-muted-foreground" size={12} />
                      <div>
                        <dt className="text-muted-foreground">Số điện thoại</dt>
                        <dd className="font-bold">{selectedRequest.phone}</dd>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <MapPin className="mt-0.5 text-muted-foreground" size={12} />
                      <div>
                        <dt className="text-muted-foreground">Khu vực</dt>
                        <dd className="font-bold">{selectedRequest.area}</dd>
                      </div>
                    </div>
                  </dl>
                </div>

                <div className="rounded border border-border p-3">
                  <h3 className="text-xs font-bold">Chi tiết Yêu cầu</h3>
                  <dl className="mt-3 space-y-3 text-[11px]">
                    <div className="flex gap-2">
                      <BookOpen
                        className="mt-0.5 text-muted-foreground"
                        size={12}
                      />
                      <div>
                        <dt className="text-muted-foreground">Môn học & Cấp độ</dt>
                        <dd className="font-bold">
                          {selectedRequest.subject} - {selectedRequest.level}
                        </dd>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <CalendarDays
                        className="mt-0.5 text-muted-foreground"
                        size={12}
                      />
                      <div>
                        <dt className="text-muted-foreground">Lịch học mong muốn</dt>
                        <dd className="font-bold">{selectedRequest.schedule}</dd>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <ListChecks
                        className="mt-0.5 text-muted-foreground"
                        size={12}
                      />
                      <div>
                        <dt className="text-muted-foreground">Yêu cầu chi tiết</dt>
                        <dd className="font-bold">{selectedRequest.note}</dd>
                      </div>
                    </div>
                  </dl>
                </div>
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
                    <div
                      key={tutor.name}
                      className="rounded border border-border bg-white p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                            {tutor.avatar}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-bold">
                              {tutor.name}
                            </div>
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
                        <Button className="h-8 rounded text-xs">
                          {index === 0 ? "Đề xuất" : "Ghép lớp"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

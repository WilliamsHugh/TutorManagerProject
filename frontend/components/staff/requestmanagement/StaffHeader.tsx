import { Bell } from "lucide-react"

export function StaffHeader() {
  return (
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
  )
}

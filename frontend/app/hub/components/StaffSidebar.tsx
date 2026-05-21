import {
  BookOpen,
  Clock3,
  FileText,
  GraduationCap,
  LayoutDashboard,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

type NavItem = {
  label: string
  icon: LucideIcon
  active?: boolean
}

const navItems: NavItem[] = [
  { label: "Tổng quan", icon: LayoutDashboard },
  { label: "Quản lý Yêu cầu", icon: FileText, active: true },
  { label: "Quản lý Gia sư", icon: UsersRound },
  { label: "Quản lý Học viên", icon: UserRound },
  { label: "Quản lý Lớp học", icon: BookOpen },
  { label: "Báo cáo thống kê", icon: Clock3 },
]

export function StaffSidebar() {
  return (
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
  )
}

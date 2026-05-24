"use client"

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
import Link from "next/link"
import { usePathname } from "next/navigation"

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { label: "Tổng quan", href: "/hub/dashboard", icon: LayoutDashboard },
  { label: "Quản lý Yêu cầu", href: "/hub/request-management", icon: FileText },
  { label: "Quản lý Gia sư", href: "/hub/tutors", icon: UsersRound },
  { label: "Quản lý Học viên", href: "/hub/students", icon: UserRound },
  { label: "Quản lý Lớp học", href: "/hub/classes", icon: BookOpen },
  { label: "Báo cáo thống kê", href: "/hub/reports", icon: Clock3 },
]

export function StaffSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[200px] shrink-0 border-r border-border bg-white">
      <nav className="space-y-1 px-3 py-5">
        {navItems.map((item) => {
          const Icon = item.icon
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href)

          return (
            <Link
              key={item.label}
              className={`flex h-9 w-full items-center gap-3 rounded px-3 text-left text-xs font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
              href={item.href}
            >
              <Icon size={14} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

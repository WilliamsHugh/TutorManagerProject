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
  { label: "Tổng quan", href: "/staff/dashboard", icon: LayoutDashboard },
  { label: "Quản lý Yêu cầu", href: "/staff/request-management", icon: FileText },
  { label: "Quản lý Gia sư", href: "/staff/tutors", icon: UsersRound },
  { label: "Quản lý Học viên", href: "/staff/students", icon: UserRound },
  { label: "Quản lý Lớp học", href: "/staff/classes", icon: BookOpen },
]

export function StaffSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[200px] shrink-0 border-r border-border bg-white">
      <div className="flex h-12 items-center gap-3 border-b border-border px-5">
        <div className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground">
          <GraduationCap size={14} />
        </div>
        <span className="text-[17px] font-bold">TutorEdu</span>
      </div>

      <nav className="space-y-1.5 px-3 py-5">
        {navItems.map((item) => {
          const Icon = item.icon
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href)

          return (
            <Link
              key={item.label}
              className={`flex h-10 w-full items-center gap-3 rounded px-3 text-left text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-foreground hover:bg-secondary"
              }`}
              href={item.href}
            >
              <Icon size={15} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

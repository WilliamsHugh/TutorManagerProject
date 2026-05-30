"use client"

import { usePathname } from "next/navigation"
import AdminGuard from "@/components/auth/AdminGuard"
import { StaffShell } from "@/app/(hub)/staff/_components/StaffShell"

export default function HubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/hub/login"

  // Không áp dụng AdminGuard và StaffShell cho trang đăng nhập nội bộ
  // để người dùng chưa đăng nhập có thể truy cập /hub/login
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AdminGuard>
      <StaffShell>{children}</StaffShell>
    </AdminGuard>
  )
}
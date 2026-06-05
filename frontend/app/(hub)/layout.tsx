"use client"

import { usePathname } from "next/navigation"
import AdminGuard from "@/components/auth/AdminGuard"

export default function HubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/hub/login"

  // Không áp dụng AdminGuard cho trang đăng nhập nội bộ
  // để người dùng chưa đăng nhập có thể truy cập /hub/login
  // StaffShell được áp dụng riêng trong từng staff page để kiểm soát breadcrumb
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AdminGuard>
      {children}
    </AdminGuard>
  )
}
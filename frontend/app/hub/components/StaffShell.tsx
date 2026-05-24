"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/staff-api"
import { saveAuth, clearAuth } from "@/lib/auth"
import { StaffSidebar } from "./StaffSidebar"

type StaffShellProps = {
  children: React.ReactNode
  current?: string
  parent?: string
}

export function StaffShell({ children, current, parent }: StaffShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getCurrentUser()
      .then((user) => {
        if (!active) return
        saveAuth("", user)
        
        const role = user?.role?.name
        if (role !== "admin" && role !== "staff") {
          router.replace("/403")
          return
        }

        if (pathname === "/hub/dashboard" && role !== "admin") {
          router.replace("/hub/request-management")
          return
        }

        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        console.error("Session verification failed:", err)
        clearAuth()
        router.replace("/hub/login")
      })
    return () => {
      active = false
    }
  }, [router, pathname])

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-[#f4f7fb]">
        <div className="text-sm font-medium text-muted-foreground animate-pulse">
          Đang xác thực phiên làm việc...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#f4f7fb] text-foreground">
      <div className="flex min-h-[calc(100vh-4.5rem)]">
        <StaffSidebar />
        <div className="min-w-0 flex-1">
          <main className="p-5">{children}</main>
        </div>
      </div>
    </div>
  )
}

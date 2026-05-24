"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserRole } from "@/lib/auth"

export default function AdminGuard({ children }: { children?: React.ReactNode }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const role = getUserRole()
    if (role !== "admin" && role !== "staff") {
      router.replace("/403")
    }
  }, [router])

  // Render children ngay từ đầu để server và client đồng nhất
  // Chỉ redirect sau khi mount — không thay đổi HTML structure
  if (!mounted) return <>{children}</>
  return <>{children}</>
}

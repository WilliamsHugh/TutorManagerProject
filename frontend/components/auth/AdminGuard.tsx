"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserRole } from "@/lib/auth"

export default function AdminGuard() {
  const router = useRouter()

  useEffect(() => {
    try {
      const role = getUserRole()
      if (role === "admin") {
        router.replace("/403")
      }
    } catch (e) {
      // noop
    }
  }, [router])

  return null
}

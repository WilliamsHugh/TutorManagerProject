"use client"

import { useState, useEffect } from "react"
import { Bell, LogOut, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { getAuthUser, clearAuth } from "@/lib/auth"

type StaffHeaderProps = {
  current?: string
  parent?: string
}

export function StaffHeader({
  current = "Danh sách",
  parent = "Quản lý Yêu cầu",
}: StaffHeaderProps) {
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null)

  useEffect(() => {
    const authUser = getAuthUser()
    if (authUser) {
      setUser({ fullName: authUser.fullName, email: authUser.email })
    }
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    clearAuth()
    router.push('/hub/login')
  }

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-white px-5">
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span className="text-muted-foreground">{parent}</span>
        <span className="text-muted-foreground">›</span>
        <span>{current}</span>
      </div>
      <div className="flex items-center gap-5">
        <Bell className="text-muted-foreground" size={15} />
        
        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors border-none bg-transparent cursor-pointer"
          >
            <div className="size-7 rounded-full bg-[linear-gradient(135deg,#0b63d6,#ffb020)]" />
            {user && <span className="hidden sm:inline max-w-24 truncate">{user.fullName}</span>}
            <ChevronDown size={12} className={`transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-white shadow-xl py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2.5 border-b border-border mb-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Tài khoản</p>
                  <p className="text-sm font-bold text-foreground truncate">{user?.fullName || "Staff"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium border-none bg-transparent cursor-pointer"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

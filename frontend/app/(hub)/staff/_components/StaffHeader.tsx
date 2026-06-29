"use client"

import { useState, useEffect } from "react"
import { Bell, LogOut, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { getAuthUser, clearAuth } from "@/lib/auth"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api"

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
  const [notifications, setNotifications] = useState<any[]>([])
  const [isNotiOpen, setIsNotiOpen] = useState(false)

  useEffect(() => {
    const authUser = getAuthUser()
    if (authUser) {
      setUser({ fullName: authUser.fullName, email: authUser.email })
      getNotifications()
        .then((data) => {
          if (Array.isArray(data)) setNotifications(data)
        })
        .catch((err) => console.error("Error loading notifications:", err))
    }
  }, [])

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.isRead).length
    : 0

  const handleNotificationClick = async (noti: any) => {
    try {
      await markNotificationAsRead(noti.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
      )
      setIsNotiOpen(false)

      const msg = noti.message?.toLowerCase() || ''
      const title = noti.title?.toLowerCase() || ''

      if (title.includes('yêu cầu') || title.includes('đề xuất') || msg.includes('đàm phán') || msg.includes('yêu cầu') || msg.includes('đề xuất') || msg.includes('thương lượng')) {
        router.push('/staff/request-management')
      } else if (title.includes('lớp học') || msg.includes('lớp học') || msg.includes('lịch học') || title.includes('lịch')) {
        router.push('/staff/classes')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    try {
      await fetch('/api/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Local logout error:', error)
    }
    clearAuth()
    router.push('/hub/login')
  };

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-white px-5">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="text-muted-foreground">{parent}</span>
        <span className="text-muted-foreground">›</span>
        <span>{current}</span>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative">
          <button
            onClick={() => setIsNotiOpen(!isNotiOpen)}
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[9px] font-bold text-white shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotiOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotiOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-white shadow-xl py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-border flex justify-between items-center">
                  <span className="font-bold text-xs text-foreground uppercase tracking-wider">Thông báo</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] text-primary hover:underline bg-transparent border-none cursor-pointer font-semibold"
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((noti: any) => (
                      <div
                        key={noti.id}
                        onClick={() => handleNotificationClick(noti)}
                        className={`px-4 py-2.5 border-b border-border hover:bg-secondary cursor-pointer transition-colors flex gap-2 items-start ${!noti.isRead ? 'bg-secondary/40' : ''}`}
                      >
                        <div className="flex-1 text-left min-w-0">
                          <span className={`block text-xs font-semibold ${!noti.isRead ? 'text-primary' : 'text-muted-foreground'}`}>
                            {noti.title}
                          </span>
                          <span className="block text-[11px] text-foreground mt-0.5 leading-snug break-words">
                            {noti.message}
                          </span>
                          <span className="block text-[9px] text-muted-foreground mt-1">
                            {new Date(noti.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        {!noti.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                      Không có thông báo nào
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors border-none bg-transparent cursor-pointer"
          >
            <div className="size-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #0b63d6, #ffb020)' }}>
              {(user?.fullName || user?.email || 'S').charAt(0).toUpperCase()}
            </div>
            {user && <span className="hidden sm:inline max-w-24 truncate">{user.fullName}</span>}
            <ChevronDown size={13} className={`transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
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

"use client";

import { GraduationCap, Menu, X, Bell, ChevronDown, LogOut, Shield, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getAuthUser, isLoggedIn as checkLoginStatus } from "@/lib/auth";
import { apiFetch } from "@/lib/api/interceptor";

import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api";

interface NavLink {
  label: string;
  href: string;
}

interface HeaderProps {
  customLinks?: NavLink[];
  showNotifications?: boolean;
  maxWidth?: string;
}

const defaultNavLinks: NavLink[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Tìm gia sư", href: "/tutors" },
  { label: "Lớp học mới", href: "/classes" },
  { label: "Giới thiệu", href: "/about" },
];

export default function Header({
  customLinks,
  showNotifications = true,
  maxWidth = "1328px"
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotiOpen, setIsNotiOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const navLinks = customLinks || defaultNavLinks;

  useEffect(() => {
    const logged = checkLoginStatus();
    setIsLoggedIn(logged);
    setUser(getAuthUser());

    if (logged) {
      getNotifications()
        .then((data) => {
          if (Array.isArray(data)) setNotifications(data);
        })
        .catch((err) => console.error("Error loading notifications:", err));
    }
  }, []);

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.isRead).length
    : 0;

  const handleNotificationClick = async (noti: any) => {
    try {
      await markNotificationAsRead(noti.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
      );
      setIsNotiOpen(false);

      const msg = noti.message?.toLowerCase() || '';
      const title = noti.title?.toLowerCase() || '';

      if (title.includes('lịch') || msg.includes('lịch học') || msg.includes('lịch dạy')) {
        router.push('/student/calendar');
      } else if (title.includes('lớp học') || msg.includes('lớp học')) {
        router.push('/student/classes');
      } else if (title.includes('đề xuất') || title.includes('yêu cầu ghép') || msg.includes('đề xuất') || msg.includes('yêu cầu ghép') || msg.includes('thương lượng')) {
        router.push('/student');
      } else if (title.includes('hồ sơ') || msg.includes('hồ sơ')) {
        router.push('/student/profile');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Kiểm tra token ngầm qua API khi load trang
  useEffect(() => {
    const verifySession = async () => {
      if (checkLoginStatus()) {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001/api';
          await apiFetch(`${backendUrl}/auth/me`, {
            headers: {
              'X-Prevent-Redirect': 'true'
            }
          });
        } catch (error) {
          // Khi lỗi, interceptor đã gọi clearAuth(), ta chỉ cần cập nhật UI
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    };
    verifySession();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001/api"}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    try {
      await fetch("/api/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Local logout error:", error);
    }
    clearAuth();
    setIsLoggedIn(false);
    setUser(null);
    if (pathname.startsWith("/hub") || pathname.startsWith("/staff")) {
      router.push("/hub/login");
    } else {
      router.push("/");
    }
  };

  return (
    <header
      className="h-18 border-b flex items-center sticky top-0 z-50 backdrop-blur-md"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
      }}
    >
      <div
        className="w-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-4"
        style={{ maxWidth }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline shrink-0 group">
          <div
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-transform group-hover:scale-105"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              boxShadow: "0 4px 12px rgba(11, 99, 214, 0.2)"
            }}
          >
            <GraduationCap size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block" style={{ color: "var(--foreground)" }}>
            TutorEdu
          </span>
        </Link>

        {/* Nav Links - Desktop */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-4 py-2 rounded-lg text-[15px] font-medium transition-all hover:bg-gray-50 whitespace-nowrap no-underline"
              style={{
                color: pathname === link.href
                  ? "var(--primary)"
                  : "var(--muted-foreground)",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isLoggedIn && user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              {showNotifications && (
                <div className="relative">
                  <button
                    aria-label="Thông báo"
                    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white text-[#687185] cursor-pointer hover:bg-gray-50 transition-all hover:scale-105 active:scale-95"
                    type="button"
                    onClick={() => setIsNotiOpen(!isNotiOpen)}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ef4444] text-[10px] font-bold text-white shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotiOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsNotiOpen(false)} />
                      <div className="absolute right-0 mt-3 w-80 rounded-2xl border shadow-2xl py-3 z-50 overflow-hidden bg-white animate-in fade-in slide-in-from-top-2" style={{ borderColor: "var(--border)" }}>
                        <div className="px-4 pb-2 border-b flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
                          <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>Thông báo</span>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              className="text-xs text-indigo-600 hover:text-indigo-800 bg-transparent border-none cursor-pointer font-medium"
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
                                className={`px-4 py-3 hover:bg-gray-50 border-b cursor-pointer transition-colors flex gap-2.5 items-start ${!noti.isRead ? 'bg-indigo-50/30' : ''}`}
                                style={{ borderColor: "var(--border)" }}
                              >
                                <div className="flex-1 text-left min-w-0">
                                  <span className={`block text-xs font-bold ${!noti.isRead ? 'text-indigo-600' : 'text-gray-500'}`}>
                                    {noti.title}
                                  </span>
                                  <span className="block text-[13px] text-gray-600 mt-0.5 leading-snug break-words">
                                    {noti.message}
                                  </span>
                                  <span className="block text-[10px] text-gray-400 mt-1">
                                    {new Date(noti.createdAt).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                                {!noti.isRead && (
                                  <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-1" />
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center text-xs text-gray-400">
                              Không có thông báo nào
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* User Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 sm:gap-3 bg-white hover:bg-gray-50 border border-black/5 rounded-full py-1.5 pl-1.5 pr-3 transition-all cursor-pointer shadow-sm"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden border shrink-0" style={{ backgroundColor: user.avatar ? 'transparent' : '#e0e7ff', borderColor: '#e0e7ff' }}>
                    {user.avatar ? (
                      <Image src={user.avatar} alt={user.fullName} width={32} height={32} className="object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-indigo-600">{(user.fullName || user.email || '?').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="hidden lg:block text-left max-w-37.5">
                    <span className="block text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>
                      {user.fullName}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-3 w-56 rounded-2xl border shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2"
                      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>

                      <div className="px-4 py-3 border-b mb-1" style={{ borderColor: "var(--border)" }}>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tài khoản</p>
                        <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{user.fullName}</p>
                        <p className="text-xs truncate opacity-60" style={{ color: "var(--muted-foreground)" }}>{user.email}</p>
                      </div>

                      <Link href={
                        user.role?.name === 'student'
                          ? '/student'
                          : user.role?.name === 'tutor'
                            ? '/tutors/dashboard'
                            : user.role?.name === 'admin'
                              ? '/hub/dashboard'
                              : user.role?.name === 'staff'
                                ? '/staff/request-management'
                                : '/'
                      }
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm no-underline hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        style={{ color: "var(--foreground)" }}>
                        <LayoutDashboard size={18} className="opacity-70" />
                        Trang Dashboard
                      </Link>
                      <Link href={
                        user.role?.name === 'student'
                          ? '/student/profile'
                          : '/tutors/profile'
                      }
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm no-underline hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        style={{ color: "var(--foreground)" }}>
                        <Shield size={18} className="opacity-70" />
                        Cài đặt hồ sơ
                      </Link>

                      <div className="h-px w-full my-1" style={{ backgroundColor: "var(--border)" }} />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm border-none bg-transparent cursor-pointer text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <LogOut size={18} />
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-10 px-5 text-sm font-bold rounded-xl transition-all hover:bg-gray-100 no-underline"
                style={{ color: "var(--foreground)" }}
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center h-10 px-5 text-sm font-bold rounded-xl transition-all hover:opacity-90 no-underline shadow-md"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  boxShadow: "0 4px 12px rgba(11, 99, 214, 0.2)"
                }}
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center hover:bg-gray-100 transition-colors"
            style={{ color: "var(--foreground)" }}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="md:hidden absolute top-18 left-0 right-0 border-b shadow-2xl w-full animate-in slide-in-from-top-4"
          style={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            zIndex: 50,
          }}
        >
          <div className="max-w-300 mx-auto px-4 py-6">
            <nav className="flex flex-col gap-2 mb-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-base font-bold transition-all hover:bg-gray-50 rounded-xl px-4 py-3 no-underline"
                  style={{
                    color: pathname === link.href
                      ? "var(--primary)"
                      : "var(--muted-foreground)",
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {!isLoggedIn && (
              <div className="flex flex-col gap-3 border-t pt-6" style={{ borderColor: "var(--border)" }}>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-12 px-4 text-base font-bold rounded-xl border no-underline"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center h-12 px-4 text-base font-bold rounded-xl no-underline"
                  style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
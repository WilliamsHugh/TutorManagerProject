"use client";

import { GraduationCap, Menu, X, Bell, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getAuthUser, isLoggedIn as checkLoginStatus } from "@/lib/auth";

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
  showNotifications = false,
  maxWidth = "1200px" 
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const navLinks = customLinks || defaultNavLinks;

  useEffect(() => {
    setIsLoggedIn(checkLoginStatus());
    setUser(getAuthUser());
  }, []);

  const handleLogout = () => {
    clearAuth();
    setIsLoggedIn(false);
    setUser(null);
    router.push("/login");
  };

  return (
    <header
      className="h-18 border-b flex items-center sticky top-0 z-50"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--background)",
      }}
    >
      <div 
        className="w-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-4"
        style={{ maxWidth }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline shrink-0">
          <div
            className="w-8 h-8 flex items-center justify-center rounded-lg"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <GraduationCap size={20} />
          </div>
          <span className="text-lg sm:text-xl font-bold" style={{ color: "var(--foreground)" }}>TutorEdu</span>
        </Link>

        {/* Nav Links - Desktop */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 overflow-hidden">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[15px] font-medium transition-colors hover:opacity-80 whitespace-nowrap"
              style={{
                color: pathname === link.href
                  ? "var(--foreground)"
                  : "var(--muted-foreground)",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          {isLoggedIn && user ? (
            <div className="flex items-center gap-3 sm:gap-5">
              {showNotifications && (
                <button
                  aria-label="Thông báo"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[#687185] cursor-pointer hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  <Bell size={20} />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[10px] font-bold text-white">
                    1
                  </span>
                </button>
              )}

              {/* User Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 sm:gap-3 bg-transparent border-none p-0 cursor-pointer"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    {user.avatar ? (
                      <Image src={user.avatar} alt={user.fullName} width={36} height={36} />
                    ) : (
                      <UserIcon size={20} className="text-indigo-600" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="block text-sm font-semibold truncate max-w-[100px]" style={{ color: "var(--foreground)" }}>
                      {user.fullName}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider font-bold opacity-50" style={{ color: "var(--muted-foreground)" }}>
                      {user.role?.name || "Thành viên"}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border shadow-xl py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2"
                    style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                    <Link href={`/dashboard/${user.role?.name || 'student'}`} 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm no-underline hover:bg-gray-50 transition-colors"
                      style={{ color: "var(--foreground)" }}>
                      <UserIcon size={16} />
                      Trang Dashboard
                    </Link>
                    <div className="h-px w-full my-1" style={{ backgroundColor: "var(--border)" }} />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm border-none bg-transparent cursor-pointer text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold rounded-lg border cursor-pointer bg-transparent transition-colors hover:bg-gray-50"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  textDecoration: "none",
                }}
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold rounded-lg cursor-pointer border-none transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  textDecoration: "none",
                }}
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center"
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
          className="md:hidden absolute top-18 left-0 right-0 border-b shadow-lg w-full"
          style={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            zIndex: 50,
          }}
        >
          <div className="max-w-[1200px] mx-auto px-4 py-4">
            <nav className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[15px] font-medium transition-colors hover:bg-gray-50 rounded-lg px-3 py-2.5 no-underline"
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
              <div className="flex flex-col gap-2 border-t pt-4" style={{ borderColor: "var(--border)" }}>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-11 px-4 text-sm font-semibold rounded-lg border cursor-pointer bg-transparent no-underline"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center h-11 px-4 text-sm font-semibold rounded-lg cursor-pointer border-none no-underline"
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

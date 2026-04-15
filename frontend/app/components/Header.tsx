"use client";

import { GraduationCap } from "lucide-react";

const navLinks = [
  { label: "Trang chủ", active: true },
  { label: "Tìm gia sư", active: false },
  { label: "Lớp học mới", active: false },
  { label: "Giới thiệu", active: false },
];

export default function Header() {
  return (
    <header
      className="h-18 border-b flex items-center"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--background)",
      }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 text-xl font-bold cursor-pointer">
          <div
            className="w-8 h-8 flex items-center justify-center rounded-lg"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <GraduationCap size={20} />
          </div>
          <span style={{ color: "var(--foreground)" }}>TutorEdu</span>
        </div>

        {/* Nav Links */}
        <nav className="flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              className="text-[15px] font-medium cursor-pointer border-none bg-transparent transition-colors hover:opacity-80"
              style={{
                color: link.active
                  ? "var(--foreground)"
                  : "var(--muted-foreground)",
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold rounded-lg border cursor-pointer bg-transparent transition-colors hover:bg-gray-50"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            Đăng nhập
          </button>
          <button
            className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold rounded-lg cursor-pointer border-none transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            Đăng ký
          </button>
        </div>
      </div>
    </header>
  );
}

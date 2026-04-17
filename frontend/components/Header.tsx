"use client";

import { GraduationCap, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Trang chủ", href: "/" },
  { label: "Tìm gia sư", href: "/tutors" },
  { label: "Lớp học mới", href: "/classes" },
  { label: "Giới thiệu", href: "/about" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      className="h-18 border-b flex items-center"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--background)",
      }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 text-lg sm:text-xl font-bold cursor-pointer shrink-0">
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

        {/* Nav Links - Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[15px] font-medium transition-colors hover:opacity-80"
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

        {/* Auth Buttons - Desktop */}
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center"
          style={{ color: "var(--foreground)" }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
            <nav className="flex flex-col gap-3 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[15px] font-medium transition-colors hover:opacity-80 w-full text-left py-2"
                  style={{
                    color: pathname === link.href
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 border-t pt-4" style={{ borderColor: "var(--border)" }}>
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold rounded-lg border cursor-pointer bg-transparent transition-colors hover:bg-gray-50 w-full"
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
                className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold rounded-lg cursor-pointer border-none transition-opacity hover:opacity-90 w-full"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  textDecoration: "none",
                }}
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

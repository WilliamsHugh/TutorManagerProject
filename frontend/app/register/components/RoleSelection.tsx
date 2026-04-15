"use client";

import { ArrowRight, BookOpen, Briefcase } from "lucide-react";
import Link from "next/link";

interface RoleSelectionProps {
  onSelectRole: (role: "student" | "tutor") => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-[1200px]">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 sm:mb-12">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-lg"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              <BookOpen size={20} />
            </div>
            <span className="text-lg sm:text-xl font-bold" style={{ color: "var(--foreground)" }}>
              TutorEdu
            </span>
          </Link>

          <div className="max-w-2xl">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight"
              style={{ color: "var(--foreground)" }}
            >
              Bạn là ai?
            </h1>
            <p
              className="text-base sm:text-lg"
              style={{ color: "var(--muted-foreground)" }}
            >
              Chọn vai trò của bạn để bắt đầu hành trình cùng TutorEdu
            </p>
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl">
          {/* Student Card */}
          <button
            onClick={() => onSelectRole("student")}
            className="flex flex-col gap-6 p-6 sm:p-8 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "var(--primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "var(--border)";
            }}
          >
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-lg"
              style={{
                backgroundColor: "var(--secondary)",
                color: "var(--primary)",
              }}
            >
              <BookOpen size={28} className="sm:w-8 sm:h-8" />
            </div>
            <div className="text-left">
              <h2
                className="text-xl sm:text-2xl font-bold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Tôi muốn tìm gia sư
              </h2>
              <p
                className="text-sm sm:text-base"
                style={{ color: "var(--muted-foreground)" }}
              >
                Tìm kiếm gia sư phù hợp và nâng cao kỹ năng của bạn
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--primary)" }}
              >
                Tiếp tục
              </span>
              <ArrowRight size={18} style={{ color: "var(--primary)" }} />
            </div>
          </button>

          {/* Tutor Card */}
          <button
            onClick={() => onSelectRole("tutor")}
            className="flex flex-col gap-6 p-6 sm:p-8 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "var(--primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "var(--border)";
            }}
          >
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-lg"
              style={{
                backgroundColor: "var(--secondary)",
                color: "var(--primary)",
              }}
            >
              <Briefcase size={28} className="sm:w-8 sm:h-8" />
            </div>
            <div className="text-left">
              <h2
                className="text-xl sm:text-2xl font-bold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Tôi muốn trở thành gia sư
              </h2>
              <p
                className="text-sm sm:text-base"
                style={{ color: "var(--muted-foreground)" }}
              >
                Chia sẻ kiến thức và kiếm thêm thu nhập
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--primary)" }}
              >
                Tiếp tục
              </span>
              <ArrowRight size={18} style={{ color: "var(--primary)" }} />
            </div>
          </button>
        </div>

        {/* Sign In Link */}
        <div className="mt-12 sm:mt-16 text-center">
          <p style={{ color: "var(--muted-foreground)" }}>
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-semibold no-underline transition-opacity hover:opacity-80"
              style={{ color: "var(--primary)" }}
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

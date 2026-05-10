"use client";

import { BookOpen, MapPin, ChevronDown, Search } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="py-12 sm:py-16 md:py-[100px] pb-16 sm:pb-20 md:pb-[120px] text-center"
      style={{
        backgroundColor: "var(--primary)",
        color: "var(--primary-foreground)",
      }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 max-w-[800px] mx-auto leading-tight">
          Khám Phá Tiềm Năng Cùng Gia Sư Xuất Sắc
        </h1>
        <p
          className="text-sm sm:text-base md:text-lg mb-8 sm:mb-12 max-w-[600px] mx-auto"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Hệ thống quản lý và kết nối gia sư uy tín hàng đầu. Trải nghiệm học
          tập thông minh hơn, đạt điểm cao hơn cùng TutorEdu.
        </p>

        {/* Search Box */}
        <div
          className="flex flex-col sm:flex-row items-stretch sm:items-center max-w-[860px] mx-auto rounded-lg sm:rounded-xl p-3 gap-3 sm:gap-0"
          style={{
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
            boxShadow:
              "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
          }}
        >
          {/* Subject Field */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 px-3 sm:px-6 py-3 sm:py-3">
            <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0">
              <BookOpen
                size={20}
                className="sm:w-6 sm:h-6"
                style={{ color: "var(--muted-foreground)" }}
              />
            </div>
            <div className="flex flex-col items-start gap-0.5 sm:gap-1 flex-1 text-left">
              <label
                className="text-[11px] sm:text-[13px] font-bold uppercase tracking-wide"
                style={{ color: "var(--foreground)" }}
              >
                Môn học
              </label>
              <div
                className="flex items-center justify-between w-full text-[13px] sm:text-[15px] cursor-pointer truncate"
                style={{ color: "var(--muted-foreground)" }}
              >
                <span className="truncate">Tìm môn Toán, Lý...</span>
                <ChevronDown size={16} className="shrink-0 ml-2" />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            className="hidden sm:block w-px h-12 shrink-0"
            style={{ backgroundColor: "var(--border)" }}
          />

          {/* Location Field */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 px-3 sm:px-6 py-3 sm:py-3">
            <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0">
              <MapPin size={20} className="sm:w-6 sm:h-6" style={{ color: "var(--muted-foreground)" }} />
            </div>
            <div className="flex flex-col items-start gap-0.5 sm:gap-1 flex-1 text-left">
              <label
                className="text-[11px] sm:text-[13px] font-bold uppercase tracking-wide"
                style={{ color: "var(--foreground)" }}
              >
                Khu vực
              </label>
              <div
                className="flex items-center justify-between w-full text-[13px] sm:text-[15px] cursor-pointer truncate"
                style={{ color: "var(--muted-foreground)" }}
              >
                <span className="truncate">Nhập thành phố...</span>
                <ChevronDown size={16} className="shrink-0 ml-2" />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <Link href="/tutors" className="w-full sm:w-auto no-underline">
            <button
              className="flex items-center justify-center gap-2 h-10 sm:h-14 px-4 sm:px-8 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl border-none cursor-pointer transition-opacity hover:opacity-90 shrink-0 w-full"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              <Search size={18} className="sm:w-5 sm:h-5" />
              <span>Tìm kiếm</span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

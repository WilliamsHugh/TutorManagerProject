"use client";

import { BookOpen, MapPin, ChevronDown, Search } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      className="py-[100px] pb-[120px] text-center"
      style={{
        backgroundColor: "var(--primary)",
        color: "var(--primary-foreground)",
      }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-6">
        <h1 className="text-5xl font-extrabold mb-6 max-w-[800px] mx-auto leading-tight">
          Khám Phá Tiềm Năng Cùng Gia Sư Xuất Sắc
        </h1>
        <p
          className="text-lg mb-12 max-w-[600px] mx-auto"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Hệ thống quản lý và kết nối gia sư uy tín hàng đầu. Trải nghiệm học
          tập thông minh hơn, đạt điểm cao hơn cùng TutorEdu.
        </p>

        {/* Search Box */}
        <div
          className="flex items-center max-w-[860px] mx-auto rounded-xl p-3"
          style={{
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
            boxShadow:
              "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
          }}
        >
          {/* Subject Field */}
          <div className="flex items-center gap-4 flex-1 px-6 py-3">
            <div className="flex items-center justify-center w-6 h-6 shrink-0">
              <BookOpen
                size={24}
                style={{ color: "var(--muted-foreground)" }}
              />
            </div>
            <div className="flex flex-col items-start gap-1 flex-1 text-left">
              <label
                className="text-[13px] font-bold uppercase tracking-wide"
                style={{ color: "var(--foreground)" }}
              >
                Môn học
              </label>
              <div
                className="flex items-center justify-between w-full text-[15px] cursor-pointer"
                style={{ color: "var(--muted-foreground)" }}
              >
                <span>Tìm môn Toán, Lý, Tiếng Anh...</span>
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            className="w-px h-12 shrink-0"
            style={{ backgroundColor: "var(--border)" }}
          />

          {/* Location Field */}
          <div className="flex items-center gap-4 flex-1 px-6 py-3">
            <div className="flex items-center justify-center w-6 h-6 shrink-0">
              <MapPin size={24} style={{ color: "var(--muted-foreground)" }} />
            </div>
            <div className="flex flex-col items-start gap-1 flex-1 text-left">
              <label
                className="text-[13px] font-bold uppercase tracking-wide"
                style={{ color: "var(--foreground)" }}
              >
                Khu vực
              </label>
              <div
                className="flex items-center justify-between w-full text-[15px] cursor-pointer"
                style={{ color: "var(--muted-foreground)" }}
              >
                <span>Nhập thành phố, quận/huyện...</span>
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button
            className="flex items-center gap-2 h-14 px-8 text-base font-semibold rounded-xl border-none cursor-pointer transition-opacity hover:opacity-90 shrink-0"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <Search size={20} />
            Tìm kiếm
          </button>
        </div>
      </div>
    </section>
  );
}

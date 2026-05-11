import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, GraduationCap } from "lucide-react";

import { navItems } from "../data";

export function StudentTutorTopbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#e2e8f0] bg-white">
      <div className="mx-auto flex h-18 max-w-360 items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6 lg:gap-10">
          <Link
            href="/dashboard/student"
            className="flex shrink-0 items-center gap-3 no-underline"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b5fff] text-white">
              <GraduationCap size={20} />
            </span>
            <span className="text-xl font-bold text-[#0b5fff]">TutorHub</span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded px-3 py-2 text-sm font-medium no-underline transition-colors ${
                  item.href === "/student/tutorrequest"
                    ? "bg-[#e6eef8] text-[#0b5fff]"
                    : "text-[#687185] hover:bg-[#f1f5f9]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <button
            aria-label="Thông báo"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[#687185]"
            type="button"
          >
            <Bell size={20} />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[10px] font-bold text-white">
              1
            </span>
          </button>

          <button
            className="hidden items-center gap-3 border-l border-black/10 bg-transparent pl-5 sm:flex"
            type="button"
          >
            <Image
              className="h-10 w-10 rounded-full object-cover"
              src="https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F18-25%2FSoutheast%20Asian%2F4"
              alt="Ảnh đại diện Phạm Tuấn"
              width={40}
              height={40}
            />
            <span className="hidden text-left md:block">
              <span className="block text-sm font-semibold text-[#0f172a]">
                Phạm Tuấn
              </span>
              <span className="block text-xs text-[#687185]">Học viên</span>
            </span>
            <ChevronDown size={16} className="text-[#687185]" />
          </button>
        </div>
      </div>
    </header>
  );
}

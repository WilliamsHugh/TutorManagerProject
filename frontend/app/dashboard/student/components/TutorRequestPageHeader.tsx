import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function TutorRequestPageHeader() {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center gap-2 text-sm text-[#64748b]">
        <Link href="/tutors" className="text-[#64748b] no-underline">
          Tìm gia sư
        </Link>
        <ChevronRight size={16} />
        <span className="font-medium text-[#0f172a]">Gửi yêu cầu</span>
      </div>
      <h1 className="mb-2 text-2xl font-bold text-[#0f172a]">
        Gửi yêu cầu tìm gia sư
      </h1>
      <p className="max-w-2xl text-sm text-[#64748b]">
        Điền nhu cầu học tập để hệ thống lọc nhanh gia sư phù hợp ngay trên
        cùng màn hình.
      </p>
    </section>
  );
}

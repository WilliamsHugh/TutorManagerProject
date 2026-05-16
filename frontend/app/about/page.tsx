"use client";

import {
  Search, ShieldCheck, Calendar, Star,
  Award, Medal, BadgeCheck,
} from "lucide-react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ─── Data ────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    icon: <Search size={28} />,
    title: "1. Tìm kiếm & Đăng ký",
    desc: "Phụ huynh hoặc học viên dễ dàng tìm kiếm gia sư phù hợp qua bộ lọc thông minh trên hệ thống.",
  },
  {
    icon: <ShieldCheck size={28} />,
    title: "2. Kiểm duyệt chặt chẽ",
    desc: "Mọi hồ sơ gia sư đều được đội ngũ chuyên môn của chúng tôi xác minh bằng cấp và đánh giá kỹ lưỡng.",
  },
  {
    icon: <Calendar size={28} />,
    title: "3. Lên lịch & Học tập",
    desc: "Học viên và gia sư thống nhất lịch trình qua hệ thống, bắt đầu quá trình giảng dạy trực tiếp hoặc trực tuyến.",
  },
  {
    icon: <Star size={28} />,
    title: "4. Đánh giá & Cải thiện",
    desc: "Ghi nhận tiến độ liên tục. Phụ huynh đánh giá chất lượng gia sư để duy trì tiêu chuẩn của nền tảng.",
  },
];

const CERTS = [
  {
    icon: <Award size={52} strokeWidth={1.5} />,
    color: "text-blue-600",
    title: "ISO 9001:2015",
    desc: "Đạt tiêu chuẩn Hệ thống Quản lý Chất lượng Quốc tế trong lĩnh vực Giáo dục & Đào tạo.",
  },
  {
    icon: <Medal size={52} strokeWidth={1.5} />,
    color: "text-orange-500",
    title: "Giải thưởng EdTech Việt Nam",
    desc: "Vinh danh Top 10 Giải pháp công nghệ giáo dục đổi mới sáng tạo năm 2023.",
  },
  {
    icon: <ShieldCheck size={52} strokeWidth={1.5} />,
    color: "text-blue-600",
    title: "Tiêu chuẩn ISO 27001",
    desc: "Hệ thống bảo mật nghiêm ngặt, đảm bảo an toàn tuyệt đối dữ liệu cá nhân của người dùng.",
  },
  {
    icon: <BadgeCheck size={52} strokeWidth={1.5} />,
    color: "text-green-500",
    title: "Cấp phép Hoạt động",
    desc: "Được Sở Giáo dục & Đào tạo cấp phép hoạt động trong lĩnh vực bồi dưỡng văn hóa.",
  },
];

const STATS = [
  { value: "50,000+", label: "Học viên đã kết nối" },
  { value: "10,000+", label: "Gia sư chất lượng" },
  { value: "98%", label: "Tỷ lệ hài lòng" },
  { value: "5+", label: "Năm phát triển vững mạnh" },
];


// ─── Page ────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)", fontFamily: "var(--font-family-body)" }}
    >
      {/* ── Header ── */}
      <Header />

      {/* ── Hero ── */}
      <section className="py-24 text-center text-white px-6 relative overflow-hidden" style={{ backgroundColor: "var(--primary)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-white" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-10 blur-2xl bg-white" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Về TutorEdu</h1>
          <p className="text-blue-100 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
            Nền tảng kết nối gia sư và học viên hàng đầu, mang lại giá trị giáo dục chất lượng cao, minh bạch và đáng tin cậy.
          </p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="max-w-7xl mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Sứ mệnh của chúng tôi</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
            <p>
              TutorEdu được thành lập với mục tiêu tạo ra một hệ sinh thái giáo dục toàn diện, nơi mọi học sinh đều có thể tiếp cận với những người thầy giỏi nhất. Chúng tôi không chỉ đơn thuần là kết nối, mà còn đồng hành cùng sự phát triển năng lực của từng cá nhân.
            </p>
            <p>
              Với nền tảng công nghệ hiện đại, kết hợp cùng quy trình xét duyệt hồ sơ nghiêm ngặt, chúng tôi cam kết mang lại môi trường học tập an toàn, minh bạch và hiệu quả nhất cho hàng ngàn gia đình trên toàn quốc.
            </p>
          </div>
        </div>
        <div className="flex-1 w-full">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            alt="Students studying in library"
            width={1200}
            height={800}
            priority
            className="rounded-2xl shadow-xl object-cover w-full h-auto max-h-[400px]"
          />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Cách thức hoạt động</h2>
            <p className="text-gray-500 text-lg">Quy trình chuyên nghiệp, minh bạch và tối ưu trải nghiệm cho cả học viên lẫn gia sư.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: "var(--secondary)", color: "var(--primary)" }}
                >
                  {step.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certifications ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Chứng nhận & Tiêu chuẩn chất lượng</h2>
            <p className="text-gray-500 text-lg">TutorEdu tự hào là đơn vị giáo dục đạt các tiêu chuẩn quốc tế và được các tổ chức uy tín hàng đầu công nhận.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Decorative connecting line */}
            <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px border-t border-dashed border-gray-200 z-0" />
            {CERTS.map((cert) => (
              <div key={cert.title} className="text-center relative z-10">
                <div className={`w-20 h-20 bg-white rounded-full mx-auto mb-6 flex items-center justify-center ${cert.color} shadow-[0_0_0_10px_white]`}>
                  {cert.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">{cert.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-20 px-6 text-white" style={{ backgroundColor: "var(--primary)" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center divide-x divide-blue-500/30">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl md:text-5xl font-extrabold mb-3">{stat.value}</div>
              <div className="text-blue-100 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}

import { User, Briefcase, ShieldCheck, ArrowRight, type LucideIcon } from "lucide-react";

interface Role {
  icon: LucideIcon;
  title: string;
  description: string;
  linkText: string;
}

const roles: Role[] = [
  {
    icon: User,
    title: "Học viên & Phụ huynh",
    description:
      "Dễ dàng tìm kiếm gia sư, theo dõi tiến độ học tập qua bảng điều khiển riêng biệt và đánh giá chất lượng giảng dạy một cách minh bạch.",
    linkText: "Trải nghiệm Dashboard",
  },
  {
    icon: Briefcase,
    title: "Gia sư Chuyên nghiệp",
    description:
      "Sử dụng lịch biểu thông minh để tránh trùng lịch, nhận thông báo lớp học mới phù hợp và gửi báo cáo học tập định kỳ chuyên nghiệp.",
    linkText: "Trải nghiệm Dashboard",
  },
  {
    icon: ShieldCheck,
    title: "Quản trị Trung tâm",
    description:
      "Quản lý toàn bộ hệ thống dữ liệu, xử lý hồ sơ đăng ký nhanh chóng và theo dõi biểu đồ doanh thu trực quan theo thời gian thực.",
    linkText: "Trải nghiệm Dashboard",
  },
];

export default function RolesSection() {
  return (
    <section className="py-20">
      <div className="w-full max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-[600px] mx-auto">
          <h2
            className="text-[32px] font-bold mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Hệ Sinh Thái Giáo Dục Toàn Diện
          </h2>
          <p
            className="text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            Nền tảng của chúng tôi cung cấp giao diện và công cụ chuyên biệt
            cho từng đối tượng, đảm bảo trải nghiệm tốt nhất.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                className="flex flex-col gap-4 p-8 rounded-lg border"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="w-14 h-14 flex items-center justify-center rounded-md mb-2"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  <Icon size={28} />
                </div>
                <h3
                  className="text-xl font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {role.title}
                </h3>
                <p
                  className="text-[15px] leading-relaxed flex-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {role.description}
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-sm font-semibold mt-2 no-underline transition-opacity hover:opacity-80"
                  style={{ color: "var(--primary)" }}
                >
                  {role.linkText}
                  <ArrowRight size={16} />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

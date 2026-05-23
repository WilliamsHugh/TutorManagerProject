import Link from "next/link";
import { GraduationCap, Phone, Mail, MapPin } from "lucide-react";

const FOOTER_LINKS = {
  explore: [
    { label: "Tìm gia sư", href: "/tutors" },
    { label: "Danh sách lớp mới", href: "/classes" },
    { label: "Hướng dẫn đăng ký", href: "/register" },
    { label: "Blog giáo dục", href: "#" },
  ],
  about: [
    { label: "Giới thiệu", href: "/about" },
    { label: "Quy chế hoạt động", href: "#" },
    { label: "Chính sách bảo mật", href: "#" },
    { label: "Liên hệ hỗ trợ", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-slate-300 py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-slate-800 pb-12">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-bold text-2xl text-white mb-2">
            <div className="bg-white text-blue-600 p-1.5 rounded-lg">
              <GraduationCap size={20} strokeWidth={2.5} />
            </div>
            TutorEdu
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Nền tảng kết nối gia sư và học viên uy tín hàng đầu. Cam kết chất lượng, minh bạch và hiệu quả cho mọi gia đình.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 className="text-white font-bold mb-6">Khám phá</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            {FOOTER_LINKS.explore.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* About */}
        <div>
          <h4 className="text-white font-bold mb-6">Về chúng tôi</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            {FOOTER_LINKS.about.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-bold mb-6">Liên hệ</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <Phone size={18} className="text-slate-500 shrink-0 mt-0.5" />
              <span>1900 6568</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={18} className="text-slate-500 shrink-0 mt-0.5" />
              <span>hello@tutoredu.vn</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-slate-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Tầng 3, Tòa nhà Tech, 125 Đường Công Nghệ, Cầu Giấy, Hà Nội
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto text-center text-sm text-slate-500">
        © 2024 TutorEdu. Tất cả các quyền được bảo lưu.
      </div>
    </footer>
  );
}

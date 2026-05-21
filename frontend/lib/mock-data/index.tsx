import {
  Search, ShieldCheck, Calendar, Star,
  Award, Medal, BadgeCheck,
} from "lucide-react";
import { ClassListing } from "@/types/class";
import { Tutor } from "@/types/tutor";

// ─── GENERAL STATS ────────────────────────────────────────────────────────
export const GENERAL_STATS = [
  { value: "10,000+", label: "Học viên tin dùng" },
  { value: "5,000+", label: "Gia sư chất lượng" },
  { value: "150+", label: "Môn học & Kỹ năng" },
  { value: "4.8/5", label: "Đánh giá trung bình" },
];

export const ABOUT_STATS = [
  { value: "50,000+", label: "Học viên đã kết nối" },
  { value: "10,000+", label: "Gia sư chất lượng" },
  { value: "98%", label: "Tỷ lệ hài lòng" },
  { value: "5+", label: "Năm phát triển vững mạnh" },
];

export const ABOUT_STEPS = [
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

export const ABOUT_CERTS = [
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

// ─── CLASSES DATA ──────────────────────────────────────────────────────────

export const CLASSES: ClassListing[] = [
  {
    id: 1,
    code: "#LH1023",
    title: "Tìm gia sư Tiếng Anh giao tiếp",
    mode: "Online",
    levelTag: "Người đi làm",
    salary: "300,000đ - 350,000đ",
    salaryNote: "/ buổi (1.5h)",
    schedule: "2 buổi/tuần (Tối Thứ 3, Thứ 5)",
    requirement: "Sinh viên ngôn ngữ Anh hoặc có kinh nghiệm sư phạm, IELTS 7.0+",
    postedAt: "Đăng 2 giờ trước",
  },
  {
    id: 2,
    code: "#LH1024",
    title: "Toán lớp 12 - Luyện thi Đại học",
    mode: "Offline",
    levelTag: "Lớp 12",
    salary: "250,000đ",
    salaryNote: "/ buổi (2h)",
    location: "Quận Cầu Giấy, Hà Nội",
    schedule: "3 buổi/tuần (Thứ 2, 4, 6)",
    postedAt: "Đăng 5 giờ trước",
  },
  {
    id: 3,
    code: "#LH1025",
    title: "Rèn chữ đẹp cho bé chuẩn bị vào lớp 1",
    mode: "Offline",
    levelTag: "Mầm non",
    salary: "150,000đ",
    salaryNote: "/ buổi (1.5h)",
    location: "Quận Đống Đa, Hà Nội",
    requirement: "Gia sư nữ, nhẹ nhàng, kiên nhẫn với trẻ em.",
    postedAt: "Đăng hôm qua",
  },
  {
    id: 4,
    code: "#LH1026",
    title: "Lập trình C++ Cơ bản",
    mode: "Online",
    levelTag: "Sinh viên",
    salary: "200,000đ",
    salaryNote: "/ buổi (2h)",
    schedule: "2 buổi/tuần (Thời gian linh hoạt)",
    requirement: "Sinh viên CNTT năm 3 hoặc năm 4, nắm vững thuật toán.",
    postedAt: "Đăng hôm qua",
  },
  {
    id: 5,
    code: "#LH1027",
    title: "Hóa Học lớp 9 - Ôn thi vào lớp 10",
    mode: "Offline",
    levelTag: "Lớp 9",
    salary: "250,000đ",
    salaryNote: "/ buổi (2h)",
    location: "Quận 1, TP.HCM",
    schedule: "2 buổi/tuần (Cuối tuần)",
    postedAt: "Đăng 2 ngày trước",
  },
  {
    id: 6,
    code: "#LH1028",
    title: "Tiếng Hàn Giao Tiếp (Sơ cấp)",
    mode: "Online",
    levelTag: "Người đi làm",
    salary: "300,000đ",
    salaryNote: "/ buổi (1.5h)",
    schedule: "3 buổi/tuần (Các buổi tối trong tuần)",
    requirement: "TOPIK 4 trở lên, ưu tiên có kinh nghiệm dạy online.",
    postedAt: "Đăng 2 ngày trước",
  },
];

export const CLASS_FILTERS = [
  {
    id: "subject",
    label: "Môn học",
    options: [
      { label: "Toán", count: 142 },
      { label: "Tiếng Anh", count: 115 },
      { label: "Vật Lý", count: 48 },
      { label: "Hóa Học", count: 36 },
      { label: "Ngữ Văn", count: 40 },
    ],
  },
  {
    id: "level",
    label: "Cấp học",
    options: [
      { label: "Cấp 1 (Tiểu học)" },
      { label: "Cấp 2 (THCS)" },
      { label: "Cấp 3 (THPT)" },
      { label: "Luyện thi Đại học" },
      { label: "Chứng chỉ (IELTS, TOEIC)" },
    ],
  },
  {
    id: "mode",
    label: "Hình thức học",
    options: [
      { label: "Học trực tuyến (Online)" },
      { label: "Học trực tiếp (Offline)" },
    ],
  },
];

export const CLASS_SORT_OPTIONS = ["Mới nhất", "Lương cao nhất", "Lương thấp nhất"];

export const TOTAL_CLASS_PAGES = 12;

// ─── TUTORS DATA ───────────────────────────────────────────────────────────

export const TUTORS: Tutor[] = [
  { id: 1, name: "Nguyễn Trần Bảo Ngọc", title: "Sinh viên Sư Phạm Toán", avatar: "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F18-25%2FSoutheast%20Asian%2F1", rating: 4.9, reviews: 120, location: "Cầu Giấy, Hà Nội", tags: ["Toán Cấp 3", "Luyện thi Đại học"], price: 200000 },
  { id: 2, name: "Lê Hoàng Nam", title: "Cử nhân Ngôn Ngữ Anh", avatar: "https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FSoutheast%20Asian%2F2", rating: 5.0, reviews: 85, location: "Quận 1, TP.HCM", tags: ["Tiếng Anh Giao Tiếp", "IELTS 7.5+"], price: 250000 },
  { id: 3, name: "Trần Thị Mai", title: "Giáo viên Tiểu học", avatar: "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F3", rating: 4.8, reviews: 210, location: "Hải Châu, Đà Nẵng", tags: ["Rèn chữ đẹp", "Toán Tiểu học"], price: 150000 },
  { id: 4, name: "Đặng Khoa", title: "Sinh viên Bách Khoa", avatar: "https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F18-25%2FSoutheast%20Asian%2F4", rating: 4.7, reviews: 54, location: "Thủ Đức, TP.HCM", tags: ["Vật Lý 12", "Lập trình C++"], price: 180000 },
  { id: 5, name: "Phạm Thúy Vân", title: "Thạc sĩ Hóa Học", avatar: "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F5", rating: 5.0, reviews: 132, location: "Đống Đa, Hà Nội", tags: ["Hóa Học", "Sinh Học"], price: 300000 },
  { id: 6, name: "Bùi Văn Tiến", title: "Giáo viên Chuyên Toán", avatar: "https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F35-50%2FSoutheast%20Asian%2F6", rating: 4.9, reviews: 310, location: "Quận 3, TP.HCM", tags: ["Toán Nâng Cao", "Bồi dưỡng HSG"], price: 350000 },
];

export const TUTOR_FILTERS = [
  {
    id: "subject", label: "Môn học",
    options: [
      { label: "Toán", count: 342 }, { label: "Tiếng Anh", count: 215 },
      { label: "Vật Lý", count: 128 }, { label: "Hóa Học", count: 96 },
      { label: "Ngữ Văn", count: 110 },
    ],
  },
  {
    id: "level", label: "Cấp học",
    options: [
      { label: "Cấp 1 (Tiểu học)" }, { label: "Cấp 2 (THCS)" },
      { label: "Cấp 3 (THPT)" }, { label: "Luyện thi Đại học" },
      { label: "Chứng chỉ (IELTS, TOEIC)" },
    ],
  },
  {
    id: "mode", label: "Hình thức học",
    options: [
      { label: "Học trực tuyến (Online)" },
      { label: "Học trực tiếp (Offline)" },
    ],
  },
];

export const TUTOR_SORT_OPTIONS = [
  "Đánh giá cao nhất",
  "Giá thấp nhất",
  "Giá cao nhất",
  "Nhiều đánh giá nhất",
];

export const TOTAL_TUTOR_PAGES = 12;

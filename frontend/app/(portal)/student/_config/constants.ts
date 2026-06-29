import type { NavItem } from "../types";

export const gradeLevels = [
  "Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5",
  "Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9",
  "Lớp 10", "Lớp 11", "Lớp 12",
  "Luyện thi Đại học"
];

export const provinces = [
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng"
];

export const districtsMap: Record<string, string[]> = {
  "TP. Hồ Chí Minh": [
    "Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 10", "Quận 11", "Quận 12",
    "Bình Thạnh", "Thủ Đức", "Gò Vấp", "Tân Bình", "Tân Phú", "Phú Nhuận", "Bình Chánh", "Hóc Môn", "Củ Chi", "Nhà Bè"
  ],
  "Hà Nội": [
    "Ba Đình", "Hoàn Kiếm", "Tây Hồ", "Long Biên", "Cầu Giấy", "Đống Đa", "Hai Bà Trưng", "Hoàng Mai", "Thanh Xuân", "Nam Từ Liêm", "Bắc Từ Liêm"
  ],
  "Đà Nẵng": [
    "Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ"
  ]
};

export const schoolsMap: Record<string, string[]> = {
  "TP. Hồ Chí Minh": [
    "THPT Chuyên Lê Hồng Phong",
    "THPT Chuyên Trần Đại Nghĩa",
    "THPT Bùi Thị Xuân",
    "THPT Gia Định",
    "THPT Nguyễn Thị Minh Khai",
    "THPT Mạc Đĩnh Chi",
    "THPT Nguyễn Hữu Huân",
    "THPT Phú Nhuận",
    "THPT Trần Phú",
    "THCS-THPT Nguyễn Khuyến"
  ],
  "Hà Nội": [
    "THPT Chu Văn An",
    "THPT Chuyên Hà Nội - Amsterdam",
    "THPT Kim Liên",
    "THPT Chuyên Nguyễn Huệ",
    "THPT Yên Hòa",
    "THPT Lương Thế Vinh"
  ],
  "Đà Nẵng": [
    "THPT Chuyên Lê Quý Đôn",
    "THPT Phan Châu Trinh",
    "THPT Hòa Vang",
    "THPT Nguyễn Hiền"
  ]
};

export const weekDays = [
  { label: "Thứ 2", value: "T2" },
  { label: "Thứ 3", value: "T3" },
  { label: "Thứ 4", value: "T4" },
  { label: "Thứ 5", value: "T5" },
  { label: "Thứ 6", value: "T6" },
  { label: "Thứ 7", value: "T7" },
  { label: "Chủ nhật", value: "CN" }
];

export const navItems: NavItem[] = [
  { label: "Đăng ký tìm gia sư", href: "/student" },
  { label: "Lớp học của tôi", href: "/student/classes" },
  { label: "Lịch học", href: "/student/calendar" },
];

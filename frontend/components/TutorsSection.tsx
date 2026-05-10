import { Star, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Tutor {
  name: string;
  title: string;
  avatar: string;
  rating: string;
  reviews: string;
  location: string;
  tags: string[];
  price: string;
}

const tutors: Tutor[] = [
  {
    name: "Nguyễn Trần Bảo Ngọc",
    title: "Sinh viên Sư Phạm Toán",
    avatar:
      "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F18-25%2FSoutheast%20Asian%2F1",
    rating: "4.9",
    reviews: "120 đánh giá",
    location: "Cầu Giấy, Hà Nội",
    tags: ["Toán Cấp 3", "Luyện thi Đại học"],
    price: "200,000đ",
  },
  {
    name: "Lê Hoàng Nam",
    title: "Cử nhân Ngôn Ngữ Anh",
    avatar:
      "https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FSoutheast%20Asian%2F2",
    rating: "5.0",
    reviews: "85 đánh giá",
    location: "Quận 1, TP.HCM",
    tags: ["Tiếng Anh Giao Tiếp", "IELTS 7.5+"],
    price: "250,000đ",
  },
  {
    name: "Trần Thị Mai",
    title: "Giáo viên Tiểu học",
    avatar:
      "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F3",
    rating: "4.8",
    reviews: "210 đánh giá",
    location: "Hải Châu, Đà Nẵng",
    tags: ["Rèn chữ đẹp", "Toán Tiểu học"],
    price: "150,000đ",
  },
];

export default function TutorsSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20" style={{ backgroundColor: "var(--secondary)" }}>
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 max-w-[600px] mx-auto">
          <h2
            className="text-2xl sm:text-[28px] lg:text-[32px] font-bold mb-3 sm:mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Gia Sư Tiêu Biểu
          </h2>
          <p
            className="text-sm sm:text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            Những gia sư có thành tích xuất sắc và nhận được nhiều đánh giá
            tích cực từ học viên.
          </p>
        </div>

        {/* Tutors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {tutors.map((tutor) => (
            <div
              key={tutor.name}
              className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 rounded-lg border"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 sm:gap-4">
                <Image
                  src={tutor.avatar}
                  alt={tutor.name}
                  width={56}
                  height={56}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shrink-0"
                  unoptimized
                />
                <div className="min-w-0">
                  <h3
                    className="text-base sm:text-lg font-semibold mb-0.5 sm:mb-1 truncate"
                    style={{ color: "var(--foreground)" }}
                  >
                    {tutor.name}
                  </h3>
                  <p
                    className="text-xs sm:text-sm truncate"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {tutor.title}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Star size={14} className="sm:w-4 sm:h-4 shrink-0" style={{ color: "var(--warning)" }} />
                  <span style={{ color: "var(--foreground)" }}>
                    {tutor.rating} ({tutor.reviews})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <MapPin
                    size={14}
                    className="sm:w-4 sm:h-4 shrink-0"
                    style={{ color: "var(--muted-foreground)" }}
                  />
                  <span style={{ color: "var(--foreground)" }}>
                    {tutor.location}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {tutor.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] sm:text-[13px] font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm"
                    style={{
                      backgroundColor: "var(--secondary)",
                      color: "var(--secondary-foreground)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-auto pt-4 sm:pt-5 border-t"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="text-base sm:text-lg font-bold"
                  style={{ color: "var(--primary)" }}
                >
                  {tutor.price}{" "}
                  <span
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    / giờ
                  </span>
                </div>
                <Link href="/tutors" className="w-full sm:w-auto no-underline">
                  <button
                    className="inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-md border cursor-pointer bg-transparent transition-colors hover:bg-gray-50 w-full"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    Xem chi tiết
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

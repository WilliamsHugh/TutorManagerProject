import {
  Calculator,
  Languages,
  Atom,
  FlaskConical,
  BookOpenCheck,
  Code,
  Music,
  Palette,
  type LucideIcon,
} from "lucide-react";

interface Subject {
  icon: LucideIcon;
  name: string;
  tutorCount: string;
}

const subjects: Subject[] = [
  { icon: Calculator, name: "Toán Học", tutorCount: "1,240 Gia sư" },
  { icon: Languages, name: "Tiếng Anh", tutorCount: "2,150 Gia sư" },
  { icon: Atom, name: "Vật Lý", tutorCount: "890 Gia sư" },
  { icon: FlaskConical, name: "Hóa Học", tutorCount: "920 Gia sư" },
  { icon: BookOpenCheck, name: "Ngữ Văn", tutorCount: "1,100 Gia sư" },
  { icon: Code, name: "Lập Trình", tutorCount: "450 Gia sư" },
  { icon: Music, name: "Âm Nhạc", tutorCount: "320 Gia sư" },
  { icon: Palette, name: "Mỹ Thuật", tutorCount: "280 Gia sư" },
];

export default function SubjectsSection() {
  return (
    <section className="py-20">
      <div className="w-full max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-[600px] mx-auto">
          <h2
            className="text-[32px] font-bold mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Môn Học Phổ Biến
          </h2>
          <p
            className="text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            Khám phá các môn học được tìm kiếm nhiều nhất trên nền tảng của
            chúng tôi.
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-4 gap-5">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <div
                key={subject.name}
                className="flex items-center gap-4 p-5 rounded-lg border cursor-pointer transition-shadow hover:shadow-md"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-md shrink-0"
                  style={{
                    backgroundColor: "var(--secondary)",
                    color: "var(--primary)",
                  }}
                >
                  <Icon size={24} />
                </div>
                <div>
                  <h3
                    className="text-base font-semibold mb-1"
                    style={{ color: "var(--foreground)" }}
                  >
                    {subject.name}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {subject.tutorCount}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

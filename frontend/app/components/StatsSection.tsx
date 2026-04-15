const stats = [
  { value: "10,000+", label: "Học viên tin dùng" },
  { value: "5,000+", label: "Gia sư chất lượng" },
  { value: "150+", label: "Môn học & Kỹ năng" },
  { value: "4.8/5", label: "Đánh giá trung bình" },
];

export default function StatsSection() {
  return (
    <section
      className="py-10 border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <h3
                className="text-4xl font-extrabold mb-2"
                style={{ color: "var(--primary)" }}
              >
                {stat.value}
              </h3>
              <p
                className="text-[15px] font-medium"
                style={{ color: "var(--muted-foreground)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";

export default function CTASection() {
  return (
    <section className="pt-10 pb-30">
      <div className="w-full max-w-[1200px] mx-auto px-6">
        <div
          className="flex overflow-hidden rounded-xl"
          style={{ backgroundColor: "var(--secondary)" }}
        >
          {/* Content */}
          <div className="flex-1 p-16 flex flex-col justify-center items-start gap-6">
            <h2
              className="text-[32px] font-bold"
              style={{ color: "var(--foreground)" }}
            >
              Bạn là một gia sư tài năng?
            </h2>
            <p
              className="text-base leading-relaxed max-w-[480px]"
              style={{ color: "var(--muted-foreground)" }}
            >
              Tham gia mạng lưới hàng ngàn gia sư giỏi của chúng tôi, tự do
              sắp xếp lịch dạy và bắt đầu gia tăng thu nhập ngay hôm nay với
              công cụ hỗ trợ tối ưu.
            </p>
            <button
              className="inline-flex items-center justify-center h-12 px-6 text-base font-semibold rounded-md border-none cursor-pointer transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Đăng ký làm gia sư
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 relative min-h-[320px]">
            <Image
              src="https://storage.googleapis.com/banani-generated-images/generated-images/3c5ff334-e0df-468f-8bee-df445f9c636d.jpg"
              alt="Teacher in classroom"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
}

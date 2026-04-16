"use client";

import { useState } from "react";
import { BookOpen, ChevronLeft, Eye, EyeOff, Upload, X } from "lucide-react";
import Link from "next/link";

interface TutorSignupProps {
  onBack: () => void;
}

const subjects = [
  "Toán Học",
  "Tiếng Anh",
  "Vật Lý",
  "Hóa Học",
  "Ngữ Văn",
  "Lập Trình",
  "Âm Nhạc",
  "Mỹ Thuật",
];

export default function TutorSignup({ onBack }: TutorSignupProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    education: "",
    experience: "",
    selectedSubjects: [] as string[],
  });
  const [certificate, setCertificate] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const toggleSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subject)
        ? prev.selectedSubjects.filter((s) => s !== subject)
        : [...prev.selectedSubjects, subject],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước file không được vượt quá 5MB");
        return;
      }
      setCertificate(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.education ||
      !formData.experience
    ) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (formData.selectedSubjects.length === 0) {
      setError("Vui lòng chọn ít nhất một môn học");
      return;
    }

    if (!certificate) {
      setError("Vui lòng tải lên bằng cấp/chứng chỉ");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Email không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
      setError("");
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center">
          <div
            className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--secondary)", color: "var(--primary)" }}
          >
            <BookOpen size={32} />
          </div>
          <h2
            className="text-2xl sm:text-3xl font-bold mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Đăng ký thành công!
          </h2>
          <p
            className="text-sm sm:text-base mb-4"
            style={{ color: "var(--muted-foreground)" }}
          >
            Cảm ơn bạn đã đăng ký. Hồ sơ của bạn đang được xét duyệt.
          </p>
          <p
            className="text-sm mb-8"
            style={{ color: "var(--muted-foreground)" }}
          >
            Chúng tôi sẽ gửi email thông báo kết quả trong vòng 24 giờ.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 text-base font-semibold rounded-lg border-none cursor-pointer transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-12 w-full flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-8 text-sm font-medium border-none bg-transparent cursor-pointer transition-opacity hover:opacity-80"
          style={{ color: "var(--primary)" }}
        >
          <ChevronLeft size={20} />
          <span>Quay lại</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            Đăng ký gia sư
          </h1>
          <p style={{ color: "var(--muted-foreground)" }}>
            Tạo hồ sơ gia sư chuyên nghiệp
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--foreground)" }}
            >
              Thông tin cơ bản
            </h2>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors focus:ring-2"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                    "--tw-ring-color": "var(--primary)",
                  } as React.CSSProperties}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email"
                  className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors focus:ring-2"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                    "--tw-ring-color": "var(--primary)",
                  } as React.CSSProperties}
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors focus:ring-2"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                    "--tw-ring-color": "var(--primary)",
                  } as React.CSSProperties}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors focus:ring-2 pr-12"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--background)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)",
                    } as React.CSSProperties}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--foreground)" }}
            >
              Thông tin chuyên môn
            </h2>

            <div className="space-y-4">
              {/* Education Level */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  Trình độ học vấn
                </label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors focus:ring-2"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                    "--tw-ring-color": "var(--primary)",
                  } as React.CSSProperties}
                >
                  <option value="">Chọn trình độ học vấn</option>
                  <option value="high_school">Tốt nghiệp THPT</option>
                  <option value="college">Cao đẳng</option>
                  <option value="bachelor">Đại học</option>
                  <option value="master">Thạc sĩ</option>
                  <option value="phd">Tiến sĩ</option>
                </select>
              </div>

              {/* Teaching Experience */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  Kinh nghiệm giảng dạy
                </label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Mô tả kinh nghiệm giảng dạy của bạn (ví dụ: 5 năm dạy Toán tại trường X, giúp 100+ học sinh đạt điểm cao)"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors focus:ring-2 resize-none"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                    "--tw-ring-color": "var(--primary)",
                  } as React.CSSProperties}
                />
              </div>

              {/* Subjects */}
              <div>
                <label
                  className="block text-sm font-medium mb-3"
                  style={{ color: "var(--foreground)" }}
                >
                  Các môn có thể dạy
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      className="px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer"
                      style={{
                        backgroundColor: formData.selectedSubjects.includes(
                          subject
                        )
                          ? "var(--primary)"
                          : "var(--card)",
                        color: formData.selectedSubjects.includes(subject)
                          ? "var(--primary-foreground)"
                          : "var(--foreground)",
                        borderColor: formData.selectedSubjects.includes(subject)
                          ? "var(--primary)"
                          : "var(--border)",
                      }}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Section */}
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--foreground)" }}
            >
              Bằng cấp & Chứng chỉ
            </h2>

            <div>
              <label
                className="block text-sm font-medium mb-3"
                style={{ color: "var(--foreground)" }}
              >
                Tải lên bằng cấp hoặc chứng chỉ (PDF, JPG, PNG - tối đa 5MB)
              </label>

              {certificate ? (
                <div
                  className="p-4 rounded-lg border-2 flex items-center justify-between"
                  style={{
                    backgroundColor: "#f0fdf4",
                    borderColor: "#86efac",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Upload size={20} style={{ color: "#22c55e" }} />
                    <div className="text-left">
                      <p className="text-sm font-medium" style={{ color: "#166534" }}>
                        {certificate.name}
                      </p>
                      <p className="text-xs" style={{ color: "#4ade80" }}>
                        {(certificate.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCertificate(null)}
                    className="border-none bg-transparent cursor-pointer p-1"
                    style={{ color: "#16a34a" }}
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label
                  className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-lg border-2 border-dashed cursor-pointer transition-colors hover:opacity-80"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--background)",
                  }}
                >
                  <Upload size={32} style={{ color: "var(--primary)" }} />
                  <p
                    className="mt-2 text-sm font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    Tải lên file hoặc kéo thả
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    PDF, JPG, PNG - tối đa 5MB
                  </p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                backgroundColor: "#fee2e2",
                color: "#991b1b",
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 px-6 text-base font-semibold rounded-lg border-none cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 text-center text-sm">
          <span style={{ color: "var(--muted-foreground)" }}>
            Đã có tài khoản?{" "}
          </span>
          <Link
            href="/login"
            className="font-semibold no-underline transition-opacity hover:opacity-80"
            style={{ color: "var(--primary)" }}
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

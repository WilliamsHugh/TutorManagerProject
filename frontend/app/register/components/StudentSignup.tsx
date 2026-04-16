"use client";

import { useState } from "react";
import { BookOpen, ChevronLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { registerStudent } from "@/lib/api";

interface StudentSignupProps {
  onBack: () => void;
}

export default function StudentSignup({ onBack }: StudentSignupProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin");
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
      const result = await registerStudent(formData);
      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
      setSuccess(true);
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
            className="text-sm sm:text-base mb-8"
            style={{ color: "var(--muted-foreground)" }}
          >
            Tài khoản của bạn đã được tạo. Vui lòng kiểm tra email để xác minh tài khoản.
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
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 w-full">
      <div className="w-full max-w-md py-8">
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
            Đăng ký học viên
          </h1>
          <p style={{ color: "var(--muted-foreground)" }}>
            Tạo tài khoản để tìm gia sư
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full h-12 px-6 text-base font-semibold rounded-lg border-none cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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

"use client";

import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAuth } from "@/lib/auth";

export default function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setErrorMsg(null);
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);

        try {
            const res = await fetch(`/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Backend trả 401 với message tiếng Việt
                setErrorMsg(data.message ?? "Đăng nhập thất bại");
                return;
            }

            // Lưu token và user vào localStorage
            saveAuth(data.access_token, data.user);
            
            // Gán cookie để Middleware có thể đọc được token (Sửa lỗi không nhảy trang)
            document.cookie = `access_token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;

            // Điều hướng theo role
            const role: string = data.user?.role?.name ?? "";
            if (role === "tutor") {
                router.push("/tutors/dashboard"); // Rút gọn đường dẫn
            } else if (role === "student") {
                // Đồng bộ với logic /student/dashboard trong middleware
                router.push("/student/dashboard"); 
            } else {
                // Fallback nếu role không xác định
                router.push("/");
            }
        } catch {
            setErrorMsg("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main
            className="flex-1 flex flex-col px-6 sm:px-12 py-8 sm:py-10 overflow-y-auto"
            style={{ backgroundColor: "var(--background)" }}
        >
            {/* Header Links */}
            <div className="flex justify-end mb-12 text-sm" style={{ color: "var(--muted-foreground)" }}>
                Chưa có tài khoản?
                <Link
                    href="/register"
                    className="ml-1.5 font-semibold no-underline"
                    style={{ color: "var(--primary)" }}
                >
                    Đăng ký
                </Link>
            </div>

            {/* Form Container */}
            <div className="w-full max-w-md mx-auto pb-12">
                {/* Title */}
                <h1
                    className="text-3xl sm:text-4xl font-bold mb-2"
                    style={{ color: "var(--foreground)" }}
                >
                    Đăng nhập
                </h1>
                <p
                    className="text-base mb-8"
                    style={{ color: "var(--muted-foreground)" }}
                >
                    Nhập thông tin tài khoản của bạn để tiếp tục
                </p>

                {/* Error banner */}
                {errorMsg && (
                    <div
                        className="flex items-start gap-2 rounded-md px-4 py-3 text-sm mb-5"
                        style={{
                            backgroundColor: "rgba(239,68,68,0.1)",
                            color: "#ef4444",
                            border: "1px solid rgba(239,68,68,0.3)",
                        }}
                    >
                        <span>⚠️</span>
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Field */}
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
                            placeholder="you@example.com"
                            required
                            disabled={isLoading}
                            className="w-full h-11 px-3.5 rounded-md border text-sm outline-none transition-colors focus:ring-2"
                            style={{
                                borderColor: "var(--border)",
                                backgroundColor: "var(--card)",
                                color: "var(--foreground)",
                                "--tw-ring-color": "var(--primary)",
                            } as React.CSSProperties}
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label
                                className="text-sm font-medium"
                                style={{ color: "var(--foreground)" }}
                            >
                                Mật khẩu
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium no-underline transition-opacity hover:opacity-80"
                                style={{ color: "var(--primary)" }}
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu của bạn"
                                required
                                disabled={isLoading}
                                className="w-full h-11 px-3.5 pr-12 rounded-md border text-sm outline-none transition-colors focus:ring-2"
                                style={{
                                    borderColor: "var(--border)",
                                    backgroundColor: "var(--card)",
                                    color: "var(--foreground)",
                                    "--tw-ring-color": "var(--primary)",
                                } as React.CSSProperties}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer p-1"
                                style={{ color: "var(--muted-foreground)" }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center gap-2.5">
                        <input
                            type="checkbox"
                            id="remember"
                            name="remember"
                            checked={formData.remember}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border cursor-pointer"
                            style={{
                                borderColor: "var(--border)",
                                accentColor: "var(--primary)",
                            }}
                        />
                        <label
                            htmlFor="remember"
                            className="text-sm cursor-pointer"
                            style={{ color: "var(--foreground)" }}
                        >
                            Ghi nhớ tôi
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 rounded-lg border-none font-semibold text-base flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90 mt-8 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: "var(--primary)",
                            color: "var(--primary-foreground)",
                        }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Đang đăng nhập...
                            </>
                        ) : (
                            <>
                                Đăng nhập
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div
                            className="absolute inset-0 flex items-center"
                            style={{ borderColor: "var(--border)" }}
                        >
                            <div
                                className="w-full border-t"
                                style={{ borderColor: "var(--border)" }}
                            />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span
                                className="px-2"
                                style={{
                                    color: "var(--muted-foreground)",
                                    backgroundColor: "var(--background)",
                                }}
                            >
                                hoặc
                            </span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="space-y-3">
                        <button
                            type="button"
                            className="w-full h-11 rounded-lg border font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors hover:opacity-80"
                            style={{
                                borderColor: "var(--border)",
                                backgroundColor: "var(--card)",
                                color: "var(--foreground)",
                            }}
                        >
                            <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Đăng nhập với Google
                        </button>

                        <button
                            type="button"
                            className="w-full h-11 rounded-lg border font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors hover:opacity-80"
                            style={{
                                borderColor: "var(--border)",
                                backgroundColor: "var(--card)",
                                color: "var(--foreground)",
                            }}
                        >
                            <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Đăng nhập với Facebook
                        </button>
                    </div>

                    {/* Terms */}
                    <p className="text-xs text-center leading-relaxed mt-8" style={{ color: "var(--muted-foreground)" }}>
                        Bằng việc đăng nhập, bạn đồng ý với{" "}
                        <Link
                            href="#"
                            className="font-medium no-underline"
                            style={{ color: "var(--foreground)" }}
                        >
                            Điều khoản sử dụng
                        </Link>
                        {" "}và{" "}
                        <Link
                            href="#"
                            className="font-medium no-underline"
                            style={{ color: "var(--foreground)" }}
                        >
                            Chính sách bảo mật
                        </Link>
                    </p>
                </form>
            </div>
        </main>
    );
}

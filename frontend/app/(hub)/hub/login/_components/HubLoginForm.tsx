"use client";

import { Eye, EyeOff, ArrowRight, Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { saveAuth } from "@/lib/auth";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:3001/api";

export default function HubLoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setErrorMsg(null);
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);

        try {
            const res = await fetch(`${BACKEND_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    portal: "hub",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.message ?? "Đăng nhập thất bại");
                return;
            }

            // Lưu token và user vào localStorage
            saveAuth(data.access_token, data.user);

            // Phân luồng theo role
            const role: string = data.user?.role?.name ?? "";
            if (role === "admin") {
                // Dùng window.location.href thay vì router.push để đảm bảo middleware
                // đọc được httpOnly cookie (access_token) do backend set, tránh bypass bảo mật
                window.location.href = "/hub/dashboard";
            } else if (role === "staff") {
                window.location.href = "/staff/request-management";
            } else {
                // Tài khoản không phải nội bộ
                setErrorMsg("Tài khoản này không có quyền truy cập cổng quản trị nội bộ.");
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
            {/* Top hint link */}
            <div className="flex justify-end mb-12 text-sm" style={{ color: "var(--muted-foreground)" }}>
                Không phải nhân viên?{" "}
                <Link
                    href="/login"
                    className="ml-1.5 font-semibold no-underline"
                    style={{ color: "var(--primary)" }}
                >
                    Đăng nhập tại đây
                </Link>
            </div>

            {/* Form Container */}
            <div className="w-full max-w-md mx-auto pb-12">
                {/* Badge */}
                <div
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6"
                    style={{
                        backgroundColor: "rgba(245,158,11,0.1)",
                        border: "1px solid rgba(245,158,11,0.3)",
                        color: "#d97706",
                    }}
                >
                    <ShieldAlert size={12} />
                    Cổng nội bộ · Hub
                </div>

                {/* Title */}
                <h1
                    className="text-3xl sm:text-4xl font-bold mb-2"
                    style={{ color: "var(--foreground)" }}
                >
                    Đăng nhập Quản trị
                </h1>
                <p className="text-base mb-8" style={{ color: "var(--muted-foreground)" }}>
                    Dành riêng cho Admin và Staff của hệ thống TutorHub
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
                            Email nội bộ
                        </label>
                        <input
                            id="hub-email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="admin@tutoredu.com"
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
                        <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: "var(--foreground)" }}
                        >
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                id="hub-password"
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

                    {/* Submit Button */}
                    <button
                        id="hub-login-submit"
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 rounded-lg border-none font-semibold text-base flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90 mt-8 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                            background: isLoading
                                ? "var(--primary)"
                                : "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)",
                            color: "#ffffff",
                        }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Đang xác thực...
                            </>
                        ) : (
                            <>
                                Truy cập cổng quản trị
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Security warning */}
                <div
                    className="mt-8 rounded-lg p-4 text-xs leading-relaxed"
                    style={{
                        backgroundColor: "rgba(245,158,11,0.06)",
                        border: "1px solid rgba(245,158,11,0.2)",
                        color: "var(--muted-foreground)",
                    }}
                >
                    🔒 <strong style={{ color: "var(--foreground)" }}>Cảnh báo bảo mật:</strong> Đây là cổng
                    đăng nhập dành riêng cho nhân viên nội bộ. Mọi hành vi truy cập trái phép sẽ bị ghi lại và xử lý theo quy định.
                </div>
            </div>
        </main>
    );
}

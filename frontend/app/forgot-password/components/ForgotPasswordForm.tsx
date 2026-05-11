"use client";

import { ArrowLeft, ArrowRight, Loader2, KeyRound, Mail, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export default function ForgotPasswordForm() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    
    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        newPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setErrorMsg(null);
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);

        try {
            const res = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.message ?? "Không thể gửi yêu cầu");
                return;
            }

            setStep(2);
        } catch {
            setErrorMsg("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);

        try {
            const res = await fetch(`${BACKEND_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    code: formData.otp,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.message ?? "Đặt lại mật khẩu thất bại");
                return;
            }

            setStep(3);
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
            <div className="flex justify-start mb-12 text-sm">
                <Link
                    href="/login"
                    className="flex items-center gap-2 font-medium no-underline hover:opacity-80 transition-opacity"
                    style={{ color: "var(--primary)" }}
                >
                    <ArrowLeft size={16} />
                    Quay lại đăng nhập
                </Link>
            </div>

            {/* Form Container */}
            <div className="w-full max-w-md mx-auto pb-12">
                {step === 1 && (
                    <>
                        <div 
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                            style={{ backgroundColor: "rgba(99, 102, 241, 0.1)", color: "var(--primary)" }}
                        >
                            <Mail size={28} />
                        </div>
                        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
                            Quên mật khẩu?
                        </h1>
                        <p className="text-base mb-8" style={{ color: "var(--muted-foreground)" }}>
                            Đừng lo lắng, chúng tôi sẽ gửi mã xác thực OTP đến email của bạn để đặt lại mật khẩu.
                        </p>

                        {errorMsg && (
                            <div className="flex items-start gap-2 rounded-md px-4 py-3 text-sm mb-5"
                                style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                                <span>⚠️</span>
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleRequestOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                    Địa chỉ Email
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

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-lg border-none font-semibold text-base flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-60"
                                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                            >
                                {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Gửi mã OTP"}
                                {!isLoading && <ArrowRight size={20} />}
                            </button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div 
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                            style={{ backgroundColor: "rgba(99, 102, 241, 0.1)", color: "var(--primary)" }}
                        >
                            <KeyRound size={28} />
                        </div>
                        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
                            Đặt lại mật khẩu
                        </h1>
                        <p className="text-base mb-8" style={{ color: "var(--muted-foreground)" }}>
                            Vui lòng nhập mã OTP đã được gửi tới <b>{formData.email}</b> và mật khẩu mới của bạn.
                        </p>

                        {errorMsg && (
                            <div className="flex items-start gap-2 rounded-md px-4 py-3 text-sm mb-5"
                                style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                                <span>⚠️</span>
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                    Mã xác thực OTP
                                </label>
                                <input
                                    type="text"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    placeholder="Nhập 6 chữ số"
                                    required
                                    maxLength={6}
                                    disabled={isLoading}
                                    className="w-full h-11 px-3.5 rounded-md border text-sm text-center font-bold tracking-widest outline-none transition-colors focus:ring-2"
                                    style={{
                                        borderColor: "var(--border)",
                                        backgroundColor: "var(--card)",
                                        color: "var(--foreground)",
                                        "--tw-ring-color": "var(--primary)",
                                    } as React.CSSProperties}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                    Mật khẩu mới
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        placeholder="Tối thiểu 6 ký tự"
                                        required
                                        minLength={6}
                                        disabled={isLoading}
                                        className="w-full h-11 px-3.5 rounded-md border text-sm outline-none transition-colors focus:ring-2"
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

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-lg border-none font-semibold text-base flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-60"
                                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                            >
                                {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Đặt lại mật khẩu"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-center text-sm font-medium bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ color: "var(--muted-foreground)" }}
                            >
                                Thử lại bằng email khác
                            </button>
                        </form>
                    </>
                )}

                {step === 3 && (
                    <div className="text-center py-10">
                        <div 
                            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
                            style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}
                        >
                            <CheckCircle2 size={48} />
                        </div>
                        <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
                            Thành công!
                        </h1>
                        <p className="text-lg mb-10" style={{ color: "var(--muted-foreground)" }}>
                            Mật khẩu của bạn đã được cập nhật thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
                        </p>

                        <Link
                            href="/login"
                            className="inline-flex w-full h-12 rounded-lg items-center justify-center font-semibold text-base no-underline transition-opacity hover:opacity-90"
                            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                        >
                            Quay lại Đăng nhập
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}

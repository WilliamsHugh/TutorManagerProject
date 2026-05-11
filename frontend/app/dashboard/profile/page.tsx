"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, Shield, Save, Loader2, CheckCircle } from "lucide-react";
import { getAuthUser, saveAuth, isLoggedIn, getToken } from "@/lib/auth";
import Header from "../../../components/Header";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export default function ProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "", // Read-only for now
        role: "",  // Read-only
    });

    useEffect(() => {
        if (!isLoggedIn()) {
            router.push("/login");
            return;
        }

        const user = getAuthUser();
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                phone: (user as any).phone || "",
                email: user.email || "",
                role: user.role?.name || "N/A",
            });
        }
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setErrorMsg(null);
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);
        setIsSuccess(false);

        try {
            const res = await fetch(`${BACKEND_URL}/auth/profile`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    fullName: formData.fullName,
                    phone: formData.phone,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.message ?? "Cập nhật hồ sơ thất bại");
                return;
            }

            // Update local storage (without token since we don't have it here and it's in cookie)
            const currentUser = getAuthUser();
            if (currentUser) {
                const updatedUser = { ...currentUser, ...data };
                // Note: saveAuth requires token, but here we only want to update localStorage
                localStorage.setItem("auth_user", JSON.stringify(updatedUser));
            }

            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
        } catch {
            setErrorMsg("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoggedIn()) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Header />

            <main className="mx-auto w-full max-w-4xl px-4 py-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-[#0f172a]">Cài đặt tài khoản</h1>
                    <p className="text-[#64748b] mt-2">Quản lý thông tin cá nhân và cài đặt tài khoản của bạn.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left: Account Overview */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mb-4 border-2 border-indigo-100">
                                    <User size={48} className="text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-[#0f172a]">{formData.fullName}</h3>
                                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                                    {formData.role}
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-center gap-3 text-sm text-[#64748b]">
                                    <Mail size={16} />
                                    <span>{formData.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[#64748b]">
                                    <Phone size={16} />
                                    <span>{formData.phone || "Chưa có số điện thoại"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Edit Form */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-[#e2e8f0] space-y-8">
                            <div className="pb-6 border-b border-[#f1f5f9]">
                                <h2 className="text-xl font-bold text-[#0f172a]">Thông tin cá nhân</h2>
                                <p className="text-sm text-[#64748b] mt-1">Thông tin này sẽ được hiển thị cho các đối tác trên nền tảng.</p>
                            </div>

                            {errorMsg && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                                    <span>⚠️</span> {errorMsg}
                                </div>
                            )}

                            {isSuccess && (
                                <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg text-sm border border-emerald-100 flex items-center gap-2">
                                    <CheckCircle size={18} /> Cập nhật hồ sơ thành công!
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#334155]">Họ và tên</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#334155]">Số điện thoại</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            placeholder="09xx xxx xxx"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#334155]">Email (Không thể thay đổi)</label>
                                <div className="relative opacity-60">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        readOnly
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

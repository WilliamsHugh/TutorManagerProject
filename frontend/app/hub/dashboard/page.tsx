"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Users, BookOpen, Settings, LogOut, ArrowRight } from "lucide-react";
import { getAuthUser, getUserRole, clearAuth, isLoggedIn } from "@/lib/auth";

export default function AdminDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);

    useEffect(() => {
        if (!isLoggedIn() || getUserRole() !== "admin") {
            router.replace("/hub/login");
            return;
        }
        const authUser = getAuthUser();
        if (authUser) {
            setUser({ fullName: authUser.fullName, email: authUser.email });
        }
    }, [router]);

    const handleLogout = () => {
        clearAuth();
        router.push("/hub/login");
    };

    if (!user) return null;

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ backgroundColor: "#0f172a", color: "#f8fafc" }}
        >
            {/* Nav Header */}
            <header
                className="px-8 py-4 border-b flex items-center justify-between"
                style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#1e293b" }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
                    >
                        <Shield size={18} color="white" />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight">TutorHub Hub</span>
                        <span className="ml-2 text-xs uppercase tracking-widest font-semibold text-yellow-500">
                            Admin
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <span className="text-sm opacity-80">
                        Xin chào, <strong className="text-white">{user.fullName}</strong> ({user.email})
                    </span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer hover:bg-red-950/30 hover:text-red-400"
                        style={{ borderColor: "rgba(255,255,255,0.15)", backgroundColor: "transparent" }}
                    >
                        <LogOut size={16} />
                        Đăng xuất
                    </button>
                </div>
            </header>

            {/* Dashboard Contents */}
            <main className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-8">
                {/* Greeting banner */}
                <div
                    className="rounded-2xl p-8 border relative overflow-hidden"
                    style={{
                        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                        borderColor: "rgba(255,255,255,0.08)",
                    }}
                >
                    <div
                        className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 pointer-events-none"
                        style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
                    />
                    <div className="relative z-10 max-w-xl space-y-3">
                        <div
                            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                            style={{
                                backgroundColor: "rgba(245,158,11,0.15)",
                                border: "1px solid rgba(245,158,11,0.3)",
                                color: "#f59e0b",
                            }}
                        >
                            <Shield size={12} />
                            Hệ thống tối mật
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            Chào mừng trở lại, {user.fullName}!
                        </h1>
                        <p className="text-base opacity-70 leading-relaxed">
                            Đây là trang Dashboard quản lý cấp cao dành cho quản trị viên hệ thống.
                            Bạn có toàn quyền theo dõi tình hình hoạt động, phê duyệt hồ sơ và thiết lập các thông số hệ thống.
                        </p>
                    </div>
                </div>

                {/* Navigation Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Block 1 */}
                    <div
                        className="p-6 rounded-xl border space-y-4 hover:border-yellow-500/50 transition-all group"
                        style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }}
                    >
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "rgba(245,158,11,0.12)" }}
                        >
                            <Users size={20} className="text-yellow-500" />
                        </div>
                        <h3 className="font-bold text-lg">Quản lý Yêu cầu (Staff)</h3>
                        <p className="text-sm opacity-60 leading-relaxed">
                            Xem danh sách yêu cầu tìm gia sư từ học viên, so khớp và tạo lớp mới.
                        </p>
                        <button
                            onClick={() => router.push("/staff/request-management")}
                            className="flex items-center gap-1.5 text-sm font-semibold text-yellow-500 border-none bg-transparent cursor-pointer group-hover:underline"
                        >
                            Truy cập quản lý
                            <ArrowRight size={16} />
                        </button>
                    </div>

                    {/* Block 2 */}
                    <div
                        className="p-6 rounded-xl border space-y-4 hover:border-yellow-500/50 transition-all group"
                        style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }}
                    >
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "rgba(59,130,246,0.12)" }}
                        >
                            <BookOpen size={20} className="text-blue-400" />
                        </div>
                        <h3 className="font-bold text-lg">Duyệt hồ sơ gia sư</h3>
                        <p className="text-sm opacity-60 leading-relaxed">
                            Kiểm duyệt, phê duyệt hoặc từ chối các yêu cầu đăng ký hồ sơ giảng dạy của gia sư mới.
                        </p>
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-400 uppercase tracking-widest inline-block">
                            Tính năng phát triển tiếp theo
                        </span>
                    </div>

                    {/* Block 3 */}
                    <div
                        className="p-6 rounded-xl border space-y-4 hover:border-yellow-500/50 transition-all group"
                        style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }}
                    >
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "rgba(168,85,247,0.12)" }}
                        >
                            <Settings size={20} className="text-purple-400" />
                        </div>
                        <h3 className="font-bold text-lg">Cấu hình Hệ thống</h3>
                        <p className="text-sm opacity-60 leading-relaxed">
                            Điều chỉnh biểu phí môn học, quản lý danh sách môn, khóa/mở khóa các tài khoản người dùng.
                        </p>
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-400 uppercase tracking-widest inline-block">
                            Tính năng phát triển tiếp theo
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}

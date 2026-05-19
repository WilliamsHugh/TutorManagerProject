"use client";

import { Shield } from "lucide-react";

export default function HubLoginSidebar() {
    return (
        <aside
            className="hidden lg:flex lg:w-[440px] flex-shrink-0 flex-col px-12 py-12 overflow-hidden relative"
            style={{
                background: "linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f1e3c 100%)",
                color: "white",
            }}
        >
            {/* Decorative background glow */}
            <div
                className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
                style={{
                    background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)",
                    transform: "translate(30%, -30%)",
                }}
            />
            <div
                className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
                style={{
                    background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
                    transform: "translate(-30%, 30%)",
                }}
            />

            {/* Brand Logo */}
            <div className="flex items-center gap-3 mb-6">
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
                >
                    <Shield size={22} color="white" />
                </div>
                <div>
                    <div className="text-xl font-bold tracking-tight">TutorHub</div>
                    <div
                        className="text-xs font-semibold uppercase tracking-widest"
                        style={{ color: "#f59e0b" }}
                    >
                        Internal Portal
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="w-12 h-px mb-12" style={{ backgroundColor: "rgba(245,158,11,0.4)" }} />

            {/* Main Content */}
            <div className="mb-auto">
                <div
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6"
                    style={{
                        backgroundColor: "rgba(245,158,11,0.15)",
                        border: "1px solid rgba(245,158,11,0.35)",
                        color: "#f59e0b",
                    }}
                >
                    <Shield size={12} />
                    Cổng quản trị nội bộ
                </div>

                <h2 className="text-4xl font-bold mb-5 leading-tight">
                    Chào mừng,<br />
                    <span style={{ color: "#f59e0b" }}>Quản trị viên</span>
                </h2>
                <p className="text-base leading-relaxed" style={{ color: "rgba(226,232,240,0.7)" }}>
                    Đây là cổng đăng nhập dành riêng cho nhân viên và quản trị viên hệ thống TutorHub.
                    Vui lòng chỉ sử dụng tài khoản nội bộ được cấp phép.
                </p>
            </div>

            {/* Security notice */}
            <div
                className="mt-auto rounded-xl p-5"
                style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                <div className="flex items-start gap-3">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: "rgba(245,158,11,0.15)" }}
                    >
                        <Shield size={16} style={{ color: "#f59e0b" }} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold mb-1">Lưu ý bảo mật</p>
                        <p className="text-xs leading-relaxed" style={{ color: "rgba(226,232,240,0.55)" }}>
                            Không chia sẻ thông tin đăng nhập. Đăng xuất sau khi sử dụng xong.
                            Phiên làm việc sẽ hết hạn sau 30 phút không hoạt động.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

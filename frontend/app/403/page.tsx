"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { getUserRole } from "@/lib/auth";

export default function ForbiddenPage() {
    const role = getUserRole();
    const dashboardLink = role ? `/dashboard/${role}` : "/";

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-red-100">
                    <ShieldAlert size={48} className="text-red-600" />
                </div>
                
                <h1 className="text-4xl font-extrabold text-[#0f172a] mb-4">403 - Truy cập bị chặn</h1>
                <p className="text-lg text-[#64748b] mb-10 leading-relaxed">
                    Rất tiếc, bạn không có quyền truy cập vào trang này. Vui lòng quay lại Dashboard dành cho vai trò của bạn.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                        href={dashboardLink}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        <Home size={18} />
                        Về Dashboard của tôi
                    </Link>
                    
                    <Link 
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#0f172a] border border-[#e2e8f0] rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                        <ArrowLeft size={18} />
                        Trang chủ
                    </Link>
                </div>
                
                <p className="mt-12 text-sm text-[#94a3b8]">
                    Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ quản trị viên.
                </p>
            </div>
        </div>
    );
}

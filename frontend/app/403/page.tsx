"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-red-100 rounded-full">
            <ShieldAlert size={48} className="text-red-600" />
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">403 - Truy cập bị chặn</h1>
        <p className="text-lg text-gray-600 mb-8">
          Rất tiếc, bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là một sự nhầm lẫn.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Quay lại trang chủ
          </Link>
          
          <Link
            href="/login"
            className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Đăng nhập tài khoản khác
          </Link>
        </div>
      </div>
    </div>
  );
}

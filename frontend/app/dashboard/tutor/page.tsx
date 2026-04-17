"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuthUser,
  getUserRole,
  clearAuth,
  isLoggedIn,
} from "@/lib/auth";

export default function TutorDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(
    null
  );

  useEffect(() => {
    if (!isLoggedIn() || getUserRole() !== "tutor") {
      router.replace("/login");
      return;
    }
    const authUser = getAuthUser();
    if (authUser) setUser({ fullName: authUser.fullName, email: authUser.email });
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-8"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Badge */}
      <span
        className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
        style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        Gia sư · Tutor
      </span>

      {/* Title */}
      <h1 className="text-4xl font-bold text-center">
        Chào mừng, {user.fullName}!
      </h1>
      <p className="text-base opacity-60 text-center max-w-md">
        Đây là trang Dashboard dành riêng cho gia sư. Giao diện đầy đủ sẽ được hoàn thiện
        ở bước tiếp theo. Hệ thống phân quyền hoạt động thành công ✅
      </p>

      {/* Info card */}
      <div
        className="w-full max-w-sm rounded-xl border p-6 space-y-3"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <div className="flex justify-between text-sm">
          <span className="opacity-60">Email</span>
          <span className="font-medium">{user.email}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="opacity-60">Role</span>
          <span className="font-medium">Tutor</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="opacity-60">Trạng thái</span>
          <span className="font-medium text-green-500">Đã xác thực</span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="px-6 py-2.5 rounded-lg border font-medium text-sm transition-opacity hover:opacity-70 cursor-pointer"
        style={{ borderColor: "var(--border)", color: "var(--foreground)", backgroundColor: "transparent" }}
      >
        Đăng xuất
      </button>
    </div>
  );
}

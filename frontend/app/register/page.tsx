"use client";

import { useState } from "react";
import RoleSelection from "./components/RoleSelection";
import StudentSignup from "./components/StudentSignup";
import TutorSignup from "./components/TutorSignup";

type UserRole = "student" | "tutor" | null;

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
      {/* Left Sidebar */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        }}
      >
        {/* Decorative elements */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f093fb 100%)",
            transform: "translate(50%, -50%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            transform: "translate(-50%, 50%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-md">
          <h2 className="text-5xl font-extrabold mb-6 leading-tight">
            Chào Mừng Bạn
          </h2>
          <p className="text-lg opacity-90 mb-8 leading-relaxed">
            Tham gia cộng đồng TutorEdu ngay hôm nay để bắt đầu hành trình học tập hoặc giảng dạy của bạn.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 shrink-0">
                <span className="text-sm font-bold">✓</span>
              </div>
              <p className="text-left">Kết nối với hàng ngàn gia sư và học viên tài năng</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 shrink-0">
                <span className="text-sm font-bold">✓</span>
              </div>
              <p className="text-left">Học tập hoặc giảng dạy một cách linh hoạt</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1 shrink-0">
                <span className="text-sm font-bold">✓</span>
              </div>
              <p className="text-left">Nâng cao kỹ năng và kiếm thêm thu nhập</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center"
        style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
      >
        {!selectedRole ? (
          <RoleSelection onSelectRole={setSelectedRole} />
        ) : selectedRole === "student" ? (
          <StudentSignup onBack={() => setSelectedRole(null)} />
        ) : (
          <TutorSignup onBack={() => setSelectedRole(null)} />
        )}
      </div>
    </div>
  );
}

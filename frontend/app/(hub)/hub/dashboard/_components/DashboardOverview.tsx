"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  BookOpen,
  CheckCircle2,
  FileText,
  Users,
  ArrowRight,
  Settings,
  UserPlus,
} from "lucide-react";

interface CountUpProps {
  end: number;
  duration?: number;
}

function CountUp({ end, duration = 1000 }: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }
    const totalFrames = Math.round(duration / 16.7);
    let frame = 0;
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeProgress = progress * (2 - progress);
      const currentCount = Math.round(easeProgress * end);
      setCount(currentCount);
      if (frame >= totalFrames) {
        setCount(end);
        clearInterval(counter);
      }
    }, 16.7);
    return () => clearInterval(counter);
  }, [end, duration]);

  return <>{count}</>;
}

function MiniListSkeleton() {
  return (
    <div className="animate-pulse space-y-2 py-1 select-none w-full">
      <div className="h-7 bg-slate-800/80 rounded w-full border border-white/5" />
      <div className="h-7 bg-slate-800/80 rounded w-full border border-white/5" />
      <div className="h-7 bg-slate-800/80 rounded w-full border border-white/5" />
    </div>
  );
}

interface DashboardOverviewProps {
  user: any;
  stats: any;
  requests: any[];
  tutors: any[];
  subjects: any[];
  users: any[];
  isLoadingRequests: boolean;
  isLoadingTutors: boolean;
  isLoadingSubjects: boolean;
  isLoadingUsers: boolean;
  onNavigateToView: (view: string) => void;
  onFilterRoleChange: (role: string) => void;
  onSelectTutor: (tutor: any) => void;
  onSelectSubject: (subject: any) => void;
  onSelectUser: (user: any) => void;
}

export function DashboardOverview({
  user,
  stats,
  requests,
  tutors,
  subjects,
  users,
  isLoadingRequests,
  isLoadingTutors,
  isLoadingSubjects,
  isLoadingUsers,
  onNavigateToView,
  onFilterRoleChange,
  onSelectTutor,
  onSelectSubject,
  onSelectUser,
}: DashboardOverviewProps) {
  const router = useRouter();

  return (
    <>
      {/* Greeting banner */}
      <div
        className="rounded-xl p-4 px-6 border relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Chào mừng trở lại, {user?.fullName}!
            </h1>
            <p className="text-xs opacity-70 mt-0.5">
              Hệ thống theo dõi và phê duyệt hồ sơ nội bộ TutorHub
            </p>
          </div>
          <div
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full self-start md:self-auto"
            style={{
              backgroundColor: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              color: "#f59e0b",
            }}
          >
            <Shield size={10} />
            Hệ thống tối mật
          </div>
        </div>
      </div>

      {/* Indicator Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Active Classes */}
        <div className="bg-[#131926] p-3.5 rounded-xl border border-white/5 relative overflow-hidden group hover:border-amber-500/30 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(245,158,11,0.12)] transition-all duration-300 ease-out">
          <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Lớp Hoạt Động</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300"><BookOpen size={14}/></div>
            </div>
            <span className="text-2xl font-bold text-amber-500 mt-2 tracking-tight drop-shadow-[0_0_8px_rgba(245,158,11,0.25)]">
              <CountUp end={stats.activeClasses} />
            </span>
          </div>
        </div>
        
        {/* Completed Classes */}
        <div className="bg-[#131926] p-3.5 rounded-xl border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(16,185,129,0.12)] transition-all duration-300 ease-out">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Lớp Hoàn Thành</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300"><CheckCircle2 size={14}/></div>
            </div>
            <span className="text-2xl font-bold text-emerald-400 mt-2 tracking-tight drop-shadow-[0_0_8px_rgba(16,185,129,0.25)]">
              <CountUp end={stats.completedClasses} />
            </span>
          </div>
        </div>

        {/* New Requests */}
        <div className="bg-[#131926] p-3.5 rounded-xl border border-white/5 relative overflow-hidden group hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(59,130,246,0.12)] transition-all duration-300 ease-out">
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Yêu Cầu Mới</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300"><FileText size={14}/></div>
            </div>
            <span className="text-2xl font-bold text-blue-400 mt-2 tracking-tight drop-shadow-[0_0_8px_rgba(59,130,246,0.25)]">
              <CountUp end={stats.newRequests} />
            </span>
          </div>
        </div>

        {/* Active Tutors */}
        <div className="bg-[#131926] p-3.5 rounded-xl border border-white/5 relative overflow-hidden group hover:border-purple-500/30 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(168,85,247,0.12)] transition-all duration-300 ease-out">
          <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Gia Sư Dạy</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300"><Users size={14}/></div>
            </div>
            <span className="text-2xl font-bold text-purple-400 mt-2 tracking-tight drop-shadow-[0_0_8px_rgba(168,85,247,0.25)]">
              <CountUp end={stats.activeTutors} />
            </span>
          </div>
        </div>

        {/* Active Students */}
        <div className="bg-[#131926] p-3.5 rounded-xl border border-white/5 relative overflow-hidden group hover:border-teal-500/30 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(20,184,166,0.12)] transition-all duration-300 ease-out col-span-2 md:col-span-1">
          <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Học Viên Học</span>
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-500 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all duration-300"><Users size={14}/></div>
            </div>
            <span className="text-2xl font-bold text-teal-400 mt-2 tracking-tight drop-shadow-[0_0_8px_rgba(20,184,166,0.25)]">
              <CountUp end={stats.learningStudents} />
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Block 1: Quản lý yêu cầu (Dành cho Staff/Admin) */}
        <div
          className="p-6 rounded-xl border space-y-4 hover:border-yellow-500/40 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)] transition-all duration-300 ease-out group cursor-pointer stagger-item"
          style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)", animationDelay: "0ms" }}
          onClick={() => router.push("/staff/request-management")}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-yellow-500/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <FileText size={20} className="text-yellow-500" />
          </div>
          <h3 className="font-bold text-lg text-white group-hover:text-yellow-400 transition-colors">Quản lý Yêu cầu (Staff)</h3>
          <p className="text-sm opacity-60 leading-relaxed text-slate-300">
            Xem danh sách yêu cầu tìm gia sư từ học viên, so khớp và tạo lớp học mới.
          </p>

          {/* Mini scrolling list of requests */}
          <div className="h-[84px] overflow-hidden relative border border-white/5 rounded-lg bg-black/30 p-2 text-[11px] select-none">
            {isLoadingRequests ? (
              <MiniListSkeleton />
            ) : (
              <div className="flex flex-col gap-1.5 animate-marquee-up">
                {requests.length > 0 ? (
                  [...requests.slice(0, 3), ...requests.slice(0, 3)].map((req, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-[#131d31]/50 px-2 py-1.5 rounded border border-white/5 cursor-pointer hover:bg-slate-700/60 hover:text-white hover:border-yellow-500/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push("/staff/request-management");
                      }}
                    >
                      <span className="font-semibold text-slate-200 truncate max-w-[120px]">{req.subject?.name || "Yêu cầu"}</span>
                      <span className="text-[9px] text-yellow-500 font-bold bg-yellow-500/10 border border-yellow-500/20 px-1.5 rounded uppercase">{req.status || "MỚI"}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-4">Không có yêu cầu nào</div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-sm font-semibold text-yellow-500">
            <span>Truy cập quản lý</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </div>
        </div>

        {/* Block 2: Duyệt hồ sơ gia sư */}
        <div
          className="p-6 rounded-xl border space-y-4 hover:border-blue-500/40 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out group cursor-pointer stagger-item"
          style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)", animationDelay: "60ms" }}
          onClick={() => onNavigateToView("tutors")}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Users size={20} className="text-blue-400" />
          </div>
          <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">Duyệt hồ sơ gia sư</h3>
          <p className="text-sm opacity-60 leading-relaxed text-slate-300">
            Phê duyệt hồ sơ đăng ký gia sư mới. Có {tutors.filter(t => t.approvalStatus === 'pending').length} hồ sơ đang chờ duyệt.
          </p>

          {/* Mini scrolling list of tutors */}
          <div className="h-[84px] overflow-hidden relative border border-white/5 rounded-lg bg-black/30 p-2 text-[11px] select-none">
            {isLoadingTutors ? (
              <MiniListSkeleton />
            ) : (
              <div className="flex flex-col gap-1.5 animate-marquee-up">
                {tutors.length > 0 ? (
                  [...tutors.slice(0, 3), ...tutors.slice(0, 3)].map((t, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-[#131d31]/50 px-2 py-1.5 rounded border border-white/5 cursor-pointer hover:bg-slate-700/60 hover:text-white hover:border-blue-500/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTutor(t);
                      }}
                    >
                      <span className="font-semibold text-slate-200 truncate max-w-[120px]">{t.user?.fullName}</span>
                      <span className="text-[9px] text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-1.5 rounded uppercase truncate max-w-[80px]">{t.educationLevel || "Gia sư"}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-4">Không có hồ sơ nào</div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-400">
            <span>Mở duyệt hồ sơ</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </div>
        </div>

        {/* Block 3: Quản lý môn học */}
        <div
          className="p-6 rounded-xl border space-y-4 hover:border-green-500/40 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(74,222,128,0.1)] transition-all duration-300 ease-out group cursor-pointer stagger-item"
          style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)", animationDelay: "120ms" }}
          onClick={() => onNavigateToView("subjects")}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <BookOpen size={20} className="text-green-400" />
          </div>
          <h3 className="font-bold text-lg text-white group-hover:text-green-400 transition-colors">Danh mục Môn học</h3>
          <p className="text-sm opacity-60 leading-relaxed text-slate-300">
            Thiết lập danh mục các môn học giảng dạy tại trung tâm gia sư, điều chỉnh trạng thái môn.
          </p>

          {/* Mini scrolling list of subjects */}
          <div className="h-[84px] overflow-hidden relative border border-white/5 rounded-lg bg-black/30 p-2 text-[11px] select-none">
            {isLoadingSubjects ? (
              <MiniListSkeleton />
            ) : (
              <div className="flex flex-col gap-1.5 animate-marquee-up">
                {subjects.length > 0 ? (
                  [...subjects.slice(0, 3), ...subjects.slice(0, 3)].map((sub, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-[#131d31]/50 px-2 py-1.5 rounded border border-white/5 cursor-pointer hover:bg-slate-700/60 hover:text-white hover:border-green-500/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSubject(sub);
                      }}
                    >
                      <span className="font-semibold text-slate-200 truncate max-w-[120px]">{sub.name}</span>
                      <span className="text-[9px] text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-1.5 rounded uppercase">{sub.gradeLevel || "Tất cả"}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-4">Không có môn học nào</div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-sm font-semibold text-green-400">
            <span>Xem danh mục môn</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </div>
        </div>

        {/* Block 4: Quản lý tài khoản */}
        <div
          className="p-6 rounded-xl border space-y-4 hover:border-purple-500/40 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(168,85,247,0.1)] transition-all duration-300 ease-out group cursor-pointer stagger-item"
          style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)", animationDelay: "180ms" }}
          onClick={() => onNavigateToView("users")}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Settings size={20} className="text-purple-400" />
          </div>
          <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">Quản lý Tài khoản</h3>
          <p className="text-sm opacity-60 leading-relaxed text-slate-300">
            Quản lý tất cả người dùng trong hệ thống. Tìm kiếm, xem hồ sơ, khóa hoặc mở khóa tài khoản.
          </p>

          {/* Mini scrolling list of accounts */}
          <div className="h-[84px] overflow-hidden relative border border-white/5 rounded-lg bg-black/30 p-2 text-[11px] select-none">
            {isLoadingUsers ? (
              <MiniListSkeleton />
            ) : (
              <div className="flex flex-col gap-1.5 animate-marquee-up">
                {users.length > 0 ? (
                  [...users.slice(0, 3), ...users.slice(0, 3)].map((u, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-[#131d31]/50 px-2 py-1.5 rounded border border-white/5 cursor-pointer hover:bg-slate-700/60 hover:text-white hover:border-purple-500/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectUser(u);
                      }}
                    >
                      <span className="font-semibold text-slate-200 truncate max-w-[120px]">{u.fullName}</span>
                      <span className="text-[9px] text-purple-400 font-bold bg-purple-500/10 border border-purple-500/20 px-1.5 rounded uppercase">{u.role?.name || "user"}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-4">Không có tài khoản nào</div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-sm font-semibold text-purple-400">
            <span>Mở quản lý tài khoản</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </div>
        </div>

        {/* Block 5: Cấp tài khoản mới */}
        <div
          className="p-6 rounded-xl border space-y-4 hover:border-pink-500/40 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(244,63,94,0.1)] transition-all duration-300 ease-out group cursor-pointer stagger-item"
          style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)", animationDelay: "240ms" }}
          onClick={() => onNavigateToView("create-account")}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-pink-500/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <UserPlus size={20} className="text-pink-400" />
          </div>
          <h3 className="font-bold text-lg text-white group-hover:text-pink-400 transition-colors">Cấp Tài khoản mới</h3>
          <p className="text-sm opacity-60 leading-relaxed text-slate-300">
            Cấp tài khoản trực tiếp cho Nhân viên quản lý (Staff) và Gia sư (Tutor) tại trung tâm.
          </p>

          {/* Mini scrolling list of role stats */}
          <div className="h-[84px] overflow-hidden relative border border-white/5 rounded-lg bg-black/30 p-2 text-[11px] select-none">
            {isLoadingUsers ? (
              <MiniListSkeleton />
            ) : (
              <div className="flex flex-col gap-1.5 animate-marquee-up">
                {[
                  { role: "Quản trị viên (Admin)", count: users.filter(u => u.role?.name === "admin").length, roleName: "admin" },
                  { role: "Nhân viên (Staff)", count: users.filter(u => u.role?.name === "staff").length, roleName: "staff" },
                  { role: "Gia sư (Tutor)", count: users.filter(u => u.role?.name === "tutor").length, roleName: "tutor" },
                  { role: "Học viên (Student)", count: users.filter(u => u.role?.name === "student").length, roleName: "student" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-[#131d31]/50 px-2 py-1.5 rounded border border-white/5 cursor-pointer hover:bg-slate-700/60 hover:text-white hover:border-pink-500/30 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilterRoleChange(item.roleName);
                      onNavigateToView("users");
                    }}
                  >
                    <span className="font-semibold text-slate-200">{item.role}</span>
                    <span className="text-[9px] text-pink-400 font-bold bg-pink-500/10 border border-pink-500/20 px-1.5 rounded uppercase">{item.count} TK</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-sm font-semibold text-pink-400">
            <span>Mở trang cấp tài khoản</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </>
  );
}

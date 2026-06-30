"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  BookOpen,
  Settings,
  LogOut,
  RotateCw,
  CheckCircle2,
  XCircle,
  BarChart4,
  UserPlus,
} from "lucide-react";
import { saveAuth, clearAuth } from "@/lib/auth";

// Subcomponents
import { DashboardOverview } from "./_components/DashboardOverview";
import { UserManagementView } from "./_components/UserManagementView";
import { TutorApprovalView } from "./_components/TutorApprovalView";
import { SubjectManagementView } from "./_components/SubjectManagementView";
import { CreateAccountForm } from "./_components/CreateAccountForm";
import { SystemLogsView } from "./_components/SystemLogsView";
import { TutorDetailModal } from "./_components/TutorDetailModal";
import { UserEditModal } from "./_components/UserEditModal";
import { SubjectEditModal } from "./_components/SubjectEditModal";
import { LogDetailModal } from "./_components/LogDetailModal";

function TableSkeleton({ cols = 5, rows = 6 }: { cols?: number; rows?: number }) {
  return (
    <div className="animate-pulse space-y-4 w-full bg-[#1e293b] p-6 rounded-xl border border-white/5">
      <div className="flex justify-between items-center mb-6">
        <div className="h-7 bg-slate-800 rounded-lg w-1/4" />
        <div className="h-7 bg-slate-800 rounded-lg w-1/3" />
      </div>
      <div className="h-9 bg-slate-800 rounded-lg w-full" />
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-2.5 border-b border-white/5">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="h-5 bg-slate-800/60 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

type ViewType = "dashboard" | "users" | "tutors" | "subjects" | "create-account" | "system-logs";

export default function AdminDashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [filterRole, setFilterRole] = useState("all");

  // Core Data States
  const [users, setUsers] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    activeClasses: 0,
    completedClasses: 0,
    newRequests: 0,
    activeTutors: 0,
    learningStudents: 0,
  });

  // System Logs States
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsLimit] = useState(8);
  const [logsSearch, setLogsSearch] = useState("");
  const [logsActionFilter, setLogsActionFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Loading States
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingTutors, setIsLoadingTutors] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Modals / Editing States
  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editingSubject, setEditingSubject] = useState<any | null>(null);

  // Date Filters for Stats
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportDate, setReportDate] = useState("");

  // Notification Toast Helper
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. Session & Auth Verification
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch(`/api/auth/me`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (res.status === 401 || res.status === 403) {
          throw new Error("Session invalid");
        }
        if (!res.ok) {
          // Bỏ qua lỗi server tạm thời (ví dụ: 502/503 trong lúc hot-reload) để tránh văng session
          console.warn("Temp server/proxy connection issue:", res.status);
          return;
        }
        const data = await res.json();

        saveAuth("", data);
        setUser({ fullName: data.fullName, email: data.email });

        if (data.role?.name !== "admin") {
          router.replace("/403");
        }
      } catch (err: any) {
        console.error("Verification failed:", err);
        // Chỉ văng về login khi nhận được mã 401/403 rõ ràng
        if (err.message === "Session invalid") {
          clearAuth();
          router.replace("/hub/login");
        }
      }
    };

    verifySession();
  }, [router]);

  useEffect(() => {
    setReportDate(new Date().toLocaleDateString("vi-VN"));
  }, []);

  // 2. Fetch data based on active view (Tối ưu hóa Lazy loading & Cache dữ liệu)
  useEffect(() => {
    if (!user) return;
    
    if (activeView === "dashboard") {
      if (users.length === 0) fetchUsers();
      if (tutors.length === 0) fetchTutors();
      if (subjects.length === 0) fetchSubjects();
      if (requests.length === 0) fetchRequests();
      fetchStats(); // Luôn cập nhật stats khi vào Dashboard hoặc đổi khoảng ngày
    } else if (activeView === "users") {
      if (users.length === 0) fetchUsers();
    } else if (activeView === "tutors") {
      if (tutors.length === 0) fetchTutors();
    } else if (activeView === "subjects") {
      if (subjects.length === 0) fetchSubjects();
    }
  }, [activeView, user, fromDate, toDate]);

  useEffect(() => {
    if (!user) return;
    if (activeView === "system-logs") {
      fetchSystemLogs();
    }
  }, [activeView, user, logsPage, logsSearch, logsActionFilter]);

  const handleRefreshActiveView = async () => {
    setIsRefreshing(true);
    try {
      if (activeView === "dashboard") {
        await Promise.all([
          fetchStats(),
          fetchRequests(),
          fetchUsers(),
          fetchTutors(),
          fetchSubjects()
        ]);
      } else if (activeView === "users") {
        await fetchUsers();
      } else if (activeView === "tutors") {
        await fetchTutors();
      } else if (activeView === "subjects") {
        await fetchSubjects();
      } else if (activeView === "system-logs") {
        await fetchSystemLogs();
      }
      showToast("Làm mới dữ liệu thành công!", "success");
    } catch (err) {
      console.error(err);
      showToast("Làm mới dữ liệu thất bại. Vui lòng thử lại!", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // API Call Helpers
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch(`/api/admin/users`, { credentials: "include" });
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchTutors = async () => {
    setIsLoadingTutors(true);
    try {
      const res = await fetch(`/api/admin/tutors`, { credentials: "include" });
      if (res.ok) setTutors(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTutors(false);
    }
  };

  const fetchSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      const res = await fetch(`/api/admin/subjects`, { credentials: "include" });
      if (res.ok) setSubjects(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const res = await fetch(`/api/class-requests`, { credentials: "include" });
      if (res.ok) setRequests(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const fetchSystemLogs = async () => {
    setIsLoadingLogs(true);
    try {
      let url = `/api/admin/logs?page=${logsPage}&limit=${logsLimit}`;
      if (logsSearch) url += `&search=${encodeURIComponent(logsSearch)}`;
      if (logsActionFilter) url += `&action=${encodeURIComponent(logsActionFilter)}`;
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSystemLogs(data.items || []);
        setLogsTotal(data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const fetchStats = async () => {
    try {
      let url = `/api/admin/stats`;
      if (fromDate && toDate) {
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
      }
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  // Actions
  const handleLogout = async () => {
    try {
      await fetch(`/api/auth/logout`, { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("Logout error:", error);
    }
    try {
      await fetch("/api/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Local logout error:", error);
    }
    clearAuth();
    router.push("/hub/login");
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
        credentials: "include",
      });
      if (res.ok) {
        showToast("Cập nhật trạng thái tài khoản thành công!");
        fetchUsers();
      } else {
        showToast("Có lỗi xảy ra!", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Có lỗi kết nối!", "error");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn XÓA VẬT LÝ tài khoản này? Hành động này không thể hoàn tác!")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Xóa tài khoản thành công!", "success");
        fetchUsers();
      } else {
        showToast(data.message || "Xóa tài khoản thất bại!", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi kết nối khi xóa tài khoản!", "error");
    }
  };

  const handleUpdateUserFromModal = async (updatedUser: any) => {
    try {
      const res = await fetch(`/api/admin/users/${updatedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          roleName: updatedUser.roleName || updatedUser.role?.name,
          isActive: updatedUser.isActive,
        }),
        credentials: "include",
      });
      if (res.ok) {
        showToast("Cập nhật thông tin tài khoản thành công!");
        setEditingUser(null);
        fetchUsers();
      } else {
        showToast("Cập nhật thất bại, email có thể đã trùng!", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Có lỗi xảy ra!", "error");
    }
  };

  const handleApproveTutor = async (tutorId: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/admin/tutors/${tutorId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (res.ok) {
        showToast(status === "approved" ? "Đã phê duyệt hồ sơ gia sư! Tài khoản đã được kích hoạt." : "Đã từ chối hồ sơ gia sư!");
        setSelectedTutor(null);
        fetchTutors();
        fetchStats();
      } else {
        showToast("Có lỗi xảy ra!", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Có lỗi kết nối!", "error");
    }
  };

  const handleDeleteTutor = async (userId: string) => {
    if (!window.confirm("HÀNH ĐỘNG NÀY KHÔNG THỂ KHÔI PHỤC!\nBạn có chắc chắn muốn xóa vĩnh viễn hồ sơ và tài khoản gia sư này?")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showToast("Đã xóa vĩnh viễn hồ sơ gia sư thành công!");
        setSelectedTutor(null);
        fetchTutors();
        fetchStats();
      } else {
        const data = await res.json();
        showToast(data.message || "Không thể xóa hồ sơ!", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Có lỗi kết nối!", "error");
    }
  };

  const handleCreateSubject = async (subjectData: any) => {
    try {
      const res = await fetch(`/api/admin/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subjectData),
        credentials: "include",
      });
      if (res.ok) {
        showToast("Thêm môn học mới thành công!");
        fetchSubjects();
      } else {
        showToast("Môn học đã tồn tại hoặc có lỗi xảy ra!", "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubjectStatus = async (subId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/subjects/${subId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
        credentials: "include",
      });
      if (res.ok) {
        showToast("Cập nhật trạng thái môn học thành công!");
        fetchSubjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSubjectFromModal = async (updatedSubject: any) => {
    try {
      const res = await fetch(`/api/admin/subjects/${updatedSubject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSubject),
        credentials: "include",
      });
      if (res.ok) {
        showToast("Cập nhật môn học thành công!");
        setEditingSubject(null);
        fetchSubjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAccount = async (accountData: any) => {
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountData),
        credentials: "include",
      });
      if (res.ok) {
        showToast(`Tạo thành công tài khoản ${accountData.roleName.toUpperCase()}!`);
        setActiveView("users");
        fetchUsers();
      } else {
        const errData = await res.json();
        showToast(errData.message || "Tạo tài khoản thất bại, email trùng!", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Có lỗi kết nối!", "error");
    }
  };



  if (!user) return null;

  return (
    <div className="min-h-screen flex font-sans bg-[#090d16] text-slate-200 selection:bg-yellow-500/30">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-2xl border transition-all duration-300 transform translate-y-0 flex items-center gap-2`}
          style={{
            backgroundColor: toastMsg.type === "success" ? "#064e3b" : "#7f1d1d",
            borderColor: toastMsg.type === "success" ? "#059669" : "#dc2626",
            color: "#f8fafc",
          }}
        >
          {toastMsg.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span className="text-sm font-semibold">{toastMsg.text}</span>
        </div>
      )}

      {/* SIDEBAR (Glassmorphism) */}
      <aside className="w-[280px] hidden md:flex flex-col border-r border-white/5 bg-[#131926]/80 backdrop-blur-xl relative z-20">
        <div className="p-6 flex flex-col gap-2 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight">TutorHub</h1>
              <div className="text-[10px] font-semibold tracking-widest text-yellow-500 uppercase">Admin Portal</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {[
            { id: "dashboard", icon: BarChart4, label: "Tổng quan", desc: "Thống kê hệ thống" },
            { id: "tutors", icon: BookOpen, label: "Duyệt hồ sơ gia sư", desc: "Hồ sơ đăng ký" },
            { id: "users", icon: Users, label: "Quản lý Tài khoản", desc: "Tất cả user" },
            { id: "subjects", icon: BookOpen, label: "Quản lý Môn học", desc: "Danh mục lớp" },
            { id: "create-account", icon: UserPlus, label: "Cấp tài khoản mới", desc: "Tạo thủ công" },
            { id: "system-logs", icon: Settings, label: "Nhật ký hệ thống", desc: "Lịch sử hoạt động" },
          ].map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ViewType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left group cursor-pointer ${
                  isActive 
                    ? "bg-yellow-500/10 border border-yellow-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]" 
                    : "border border-transparent hover:bg-white/5 hover:border-white/10"
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${isActive ? "bg-yellow-500/20 text-yellow-400" : "bg-slate-800 text-slate-400 group-hover:text-slate-200"}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${isActive ? "text-yellow-400" : "text-slate-300 group-hover:text-white"}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-slate-900/30">
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 group">
            <div className="flex items-center gap-3 truncate">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-yellow-500 border border-yellow-500/30">
                {user.fullName.charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{user.fullName}</div>
                <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-[#131926]/50 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span className="cursor-pointer hover:text-white transition-colors flex items-center gap-2" onClick={() => setActiveView("dashboard")}>
              <Shield size={14} className="text-yellow-500"/> Admin Portal
            </span>
            <span className="opacity-50">/</span>
            <span className="text-yellow-500 font-semibold tracking-wider uppercase">
              {activeView === "dashboard" && "Tổng quan"}
              {activeView === "users" && "Quản lý Tài khoản"}
              {activeView === "tutors" && "Duyệt hồ sơ gia sư"}
              {activeView === "subjects" && "Danh mục môn học"}
              {activeView === "create-account" && "Cấp tài khoản mới"}
              {activeView === "system-logs" && "Nhật ký hệ thống"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshActiveView}
              disabled={isRefreshing}
              className="h-8 px-3 rounded-lg border border-white/10 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all select-none"
            >
              <RotateCw size={12} className={`${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Đang tải..." : "Làm mới"}</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-1/4 w-1/2 h-[300px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 w-full max-w-6xl mx-auto space-y-8">
            <style>{`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(16px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .stagger-item {
                opacity: 0;
                animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              @keyframes marqueeUp {
                0% {
                  transform: translateY(0);
                }
                100% {
                  transform: translateY(-50%);
                }
              }
              .animate-marquee-up {
                animation: marqueeUp 12s linear infinite;
              }
              .animate-marquee-up:hover {
                animation-play-state: paused;
              }
              .custom-select {
                appearance: none;
                -webkit-appearance: none;
                -moz-appearance: none;
                background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23f59e0b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E") !important;
                background-position: right 0.5rem center !important;
                background-size: 1.25rem 1.25rem !important;
                background-repeat: no-repeat !important;
                padding-right: 2.25rem !important;
                transition: all 0.2s ease-in-out;
              }
              .custom-select:hover {
                border-color: rgba(245, 158, 11, 0.4) !important;
              }
              .custom-select:focus {
                border-color: #f59e0b !important;
                box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.2) !important;
              }
            `}</style>
        {/* VIEW 1: DASHBOARD HOME (CARDS GRID) */}
        {activeView === "dashboard" && (
          <DashboardOverview
            user={user}
            stats={stats}
            requests={requests}
            tutors={tutors}
            subjects={subjects}
            users={users}
            isLoadingRequests={isLoadingRequests}
            isLoadingTutors={isLoadingTutors}
            isLoadingSubjects={isLoadingSubjects}
            isLoadingUsers={isLoadingUsers}
            onNavigateToView={(v) => setActiveView(v as ViewType)}
            onFilterRoleChange={setFilterRole}
            onSelectTutor={setSelectedTutor}
            onSelectSubject={setEditingSubject}
            onSelectUser={setEditingUser}
          />
        )}

        {/* VIEW 2: QUẢN LÝ TÀI KHOẢN (USERS) */}
        {activeView === "users" && (
          isLoadingUsers ? (
            <TableSkeleton cols={5} rows={6} />
          ) : (
            <UserManagementView
              users={users}
              onNavigateToView={(v) => setActiveView(v as ViewType)}
              onEditUser={setEditingUser}
              onToggleStatus={handleToggleUserStatus}
              onDeleteUser={handleDeleteUser}
            />
          )
        )}

        {/* VIEW 3: PHÊ DUYỆT HỒ SƠ GIA SƯ (TUTORS) */}
        {activeView === "tutors" && (
          isLoadingTutors ? (
            <TableSkeleton cols={5} rows={6} />
          ) : (
            <TutorApprovalView
              tutors={tutors}
              onSelectTutor={setSelectedTutor}
            />
          )
        )}

        {/* VIEW 4: QUẢN LÝ MÔN HỌC (SUBJECTS) */}
        {activeView === "subjects" && (
          isLoadingSubjects ? (
            <TableSkeleton cols={5} rows={6} />
          ) : (
            <SubjectManagementView
              subjects={subjects}
              onCreateSubject={handleCreateSubject}
              onEditSubject={setEditingSubject}
              onToggleStatus={handleToggleSubjectStatus}
            />
          )
        )}


        {/* VIEW 6: CẤP TÀI KHOẢN MỚI (CREATE ACCOUNT) */}
        {activeView === "create-account" && (
          <CreateAccountForm
            onCreateAccount={handleCreateAccount}
          />
        )}

        {/* VIEW 7: NHẬT KÝ HỆ THỐNG (SYSTEM LOGS) */}
        {activeView === "system-logs" && (
          isLoadingLogs ? (
            <TableSkeleton cols={6} rows={6} />
          ) : (
            <SystemLogsView
              systemLogs={systemLogs}
              logsSearch={logsSearch}
              setLogsSearch={setLogsSearch}
              logsActionFilter={logsActionFilter}
              setLogsActionFilter={setLogsActionFilter}
              logsPage={logsPage}
              setLogsPage={setLogsPage}
              logsTotal={logsTotal}
              logsLimit={logsLimit}
              onSelectLog={setSelectedLog}
            />
          )
        )}
          </div>
        </div>
      </main>

      {/* MODALS */}
      <TutorDetailModal
        tutor={selectedTutor}
        onClose={() => setSelectedTutor(null)}
        onApprove={handleApproveTutor}
        onDelete={handleDeleteTutor}
      />

      <UserEditModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleUpdateUserFromModal}
      />

      <SubjectEditModal
        subject={editingSubject}
        onClose={() => setEditingSubject(null)}
        onSave={handleUpdateSubjectFromModal}
      />

      <LogDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}

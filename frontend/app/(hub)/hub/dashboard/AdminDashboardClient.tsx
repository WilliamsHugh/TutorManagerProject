"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  BookOpen,
  Settings,
  LogOut,
  ArrowRight,
  UserPlus,
  FileText,
  CheckCircle2,
  XCircle,
  Calendar,
  Plus,
  Edit2,
  Lock,
  Unlock,
  Eye,
  BarChart4,
  Printer,
  ChevronLeft,
  Search,
} from "lucide-react";
import { getAuthUser, saveAuth, clearAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ViewType = "dashboard" | "users" | "tutors" | "subjects" | "reports" | "create-account";

export default function AdminDashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("dashboard");

  // Core Data States
  const [users, setUsers] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    activeClasses: 0,
    completedClasses: 0,
    newRequests: 0,
    activeTutors: 0,
    learningStudents: 0,
  });

  // Filter & Search States
  const [searchUser, setSearchUser] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterTutorStatus, setFilterTutorStatus] = useState("all");
    useEffect(() => {
        setUser({ fullName: "Staff Preview", email: "staff@preview.local" });
    }, [router]);

  // Modals / Editing States
  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editingSubject, setEditingSubject] = useState<any | null>(null);

  // Forms / Action States
  const [newSubject, setNewSubject] = useState({ name: "", gradeLevel: "", description: "" });
  const [newAccount, setNewAccount] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    address: "",
    roleName: "staff",
  });

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
        if (!res.ok) throw new Error("Session invalid");
        const data = await res.json();

        saveAuth("", data);
        setUser({ fullName: data.fullName, email: data.email });

        if (data.role?.name !== "admin") {
          router.replace("/403");
        }
      } catch (err) {
        console.error("Verification failed:", err);
        clearAuth();
        router.replace("/hub/login");
      }
    };

    verifySession();
  }, [router]);

  useEffect(() => {
    setReportDate(new Date().toLocaleDateString("vi-VN"));
  }, []);

  // 2. Fetch data based on active view
  useEffect(() => {
    if (!user) return;
    if (activeView === "users" || activeView === "dashboard") fetchUsers();
    if (activeView === "tutors" || activeView === "dashboard") fetchTutors();
    if (activeView === "subjects" || activeView === "dashboard") fetchSubjects();
    if (activeView === "reports" || activeView === "dashboard") fetchStats();
  }, [activeView, user, fromDate, toDate]);

  // API Call Helpers
  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users`, { credentials: "include" });
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTutors = async () => {
    try {
      const res = await fetch(`/api/admin/tutors`, { credentials: "include" });
      if (res.ok) setTutors(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`/api/admin/subjects`, { credentials: "include" });
      if (res.ok) setSubjects(await res.json());
    } catch (err) {
      console.error(err);
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

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editingUser.fullName,
          email: editingUser.email,
          phone: editingUser.phone,
          address: editingUser.address,
          roleName: editingUser.roleName || editingUser.role?.name,
          isActive: editingUser.isActive,
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

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name) return;
    try {
      const res = await fetch(`/api/admin/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubject),
        credentials: "include",
      });
      if (res.ok) {
        showToast("Thêm môn học mới thành công!");
        setNewSubject({ name: "", gradeLevel: "", description: "" });
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

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    try {
      const res = await fetch(`/api/admin/subjects/${editingSubject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSubject),
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

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccount),
        credentials: "include",
      });
      if (res.ok) {
        showToast(`Tạo thành công tài khoản ${newAccount.roleName.toUpperCase()}!`);
        setNewAccount({
          email: "",
          password: "",
          fullName: "",
          phone: "",
          address: "",
          roleName: "staff",
        });
        setActiveView("users");
      } else {
        const errData = await res.json();
        showToast(errData.message || "Tạo tài khoản thất bại, email trùng!", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Có lỗi kết nối!", "error");
    }
  };

  const printReport = () => {
    window.print();
  };

  // Filters mapping
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      (u.phone && u.phone.includes(searchUser));
    const matchesRole = filterRole === "all" || u.role?.name === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredTutors = tutors.filter((t) => {
    if (filterTutorStatus === "all") return true;
    return t.approvalStatus === filterTutorStatus;
  });

  if (!user) return null;

  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{ backgroundColor: "#0f172a", color: "#f8fafc" }}
    >
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

      {/* Nav Header */}
      <header
        className="px-8 py-4 border-b flex items-center justify-between"
        style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#1e293b" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
            onClick={() => setActiveView("dashboard")}
          >
            <Shield size={18} color="white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight cursor-pointer" onClick={() => setActiveView("dashboard")}>
              TutorHub Admin
            </span>
            <span className="ml-2 text-xs uppercase tracking-widest font-semibold text-yellow-500">
              Cấp Cao
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-sm opacity-80 hidden md:inline">
            Xin chào, <strong className="text-white">{user.fullName}</strong>
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

      {/* Breadcrumb Path */}
      {activeView !== "dashboard" && (
        <div className="px-8 py-3 bg-[#131d31]/50 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span className="hover:text-yellow-500 cursor-pointer" onClick={() => setActiveView("dashboard")}>
              Dashboard
            </span>
            <span>/</span>
            <span className="text-yellow-500 uppercase tracking-wider font-semibold">
              {activeView === "users" && "Quản lý Tài khoản"}
              {activeView === "tutors" && "Phê duyệt Gia sư"}
              {activeView === "subjects" && "Quản lý Môn học"}
              {activeView === "reports" && "Thống kê & Báo cáo"}
              {activeView === "create-account" && "Cấp tài khoản mới"}
            </span>
          </div>
          <button
            onClick={() => setActiveView("dashboard")}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
          >
            <ChevronLeft size={14} />
            Quay lại Dashboard
          </button>
        </div>
      )}

      {/* Dashboard Contents */}
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* VIEW 1: DASHBOARD HOME (CARDS GRID) */}
        {activeView === "dashboard" && (
          <>
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
                  Bạn có toàn quyền theo dõi tình hình hoạt động, phê duyệt hồ sơ và cấp tài khoản.
                </p>
              </div>
            </div>

            {/* Indicator Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-[#1e293b] p-5 rounded-xl border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-semibold">Lớp Hoạt Động</span>
                <span className="text-2xl font-bold text-yellow-500 mt-2">{stats.activeClasses}</span>
              </div>
              <div className="bg-[#1e293b] p-5 rounded-xl border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-semibold">Lớp Hoàn Thành</span>
                <span className="text-2xl font-bold text-green-400 mt-2">{stats.completedClasses}</span>
              </div>
              <div className="bg-[#1e293b] p-5 rounded-xl border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-semibold">Yêu Cầu Mới</span>
                <span className="text-2xl font-bold text-blue-400 mt-2">{stats.newRequests}</span>
              </div>
              <div className="bg-[#1e293b] p-5 rounded-xl border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-semibold">Gia Sư Đang Dạy</span>
                <span className="text-2xl font-bold text-purple-400 mt-2">{stats.activeTutors}</span>
              </div>
              <div className="bg-[#1e293b] p-5 rounded-xl border border-[rgba(255,255,255,0.08)] flex flex-col justify-between col-span-2 md:col-span-1">
                <span className="text-xs text-slate-400 font-semibold">Học Viên Đang Học</span>
                <span className="text-2xl font-bold text-teal-400 mt-2">{stats.learningStudents}</span>
              </div>
            </div>

            {/* Navigation Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Block 1: Quản lý yêu cầu (Dành cho Staff/Admin) */}
              <div
                className="p-6 rounded-xl border space-y-4 hover:border-yellow-500/50 transition-all group cursor-pointer"
                style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }}
                onClick={() => router.push("/staff/request-management")}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-yellow-500/10">
                  <FileText size={20} className="text-yellow-500" />
                </div>
                <h3 className="font-bold text-lg">Quản lý Yêu cầu (Staff)</h3>
                <p className="text-sm opacity-60 leading-relaxed">
                  Xem danh sách yêu cầu tìm gia sư từ học viên, so khớp và tạo lớp học mới.
                </p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-yellow-500 group-hover:underline">
                  Truy cập quản lý <ArrowRight size={16} />
                </div>
              </div>

              {/* Block 2: Duyệt hồ sơ gia sư */}
              <div
                className="p-6 rounded-xl border space-y-4 hover:border-yellow-500/50 transition-all group cursor-pointer"
                style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }}
                onClick={() => setActiveView("tutors")}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10">
                  <Users size={20} className="text-blue-400" />
                </div>
                <h3 className="font-bold text-lg">Duyệt hồ sơ gia sư</h3>
                <p className="text-sm opacity-60 leading-relaxed">
                  Phê duyệt hồ sơ đăng ký gia sư mới. Có {tutors.filter(t => t.approvalStatus === 'pending').length} hồ sơ đang chờ duyệt.
                </p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-400 group-hover:underline">
                  Mở duyệt hồ sơ <ArrowRight size={16} />
                </div>
              </div>

              {/* Block 3: Quản lý môn học */}
              <div
                className="p-6 rounded-xl border space-y-4 hover:border-yellow-500/50 transition-all group cursor-pointer"
                style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }}
                onClick={() => setActiveView("subjects")}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/10">
                  <BookOpen size={20} className="text-green-400" />
                </div>
                <h3 className="font-bold text-lg">Danh mục Môn học</h3>
                <p className="text-sm opacity-60 leading-relaxed">
                  Thiết lập danh mục các môn học giảng dạy tại trung tâm gia sư, điều chỉnh trạng thái môn.
                </p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-green-400 group-hover:underline">
                  Xem danh mục môn <ArrowRight size={16} />
                </div>
              </div>

              {/* Block 4: Quản lý tài khoản */}
              <div
                className="p-6 rounded-xl border space-y-4 hover:border-yellow-500/50 transition-all group cursor-pointer"
                style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }}
                onClick={() => setActiveView("users")}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/10">
                  <Settings size={20} className="text-purple-400" />
                </div>
                <h3 className="font-bold text-lg">Quản lý Tài khoản</h3>
                <p className="text-sm opacity-60 leading-relaxed">
                  Quản lý tất cả người dùng trong hệ thống. Tìm kiếm, xem hồ sơ, khóa hoặc mở khóa tài khoản.
                </p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-purple-400 group-hover:underline">
                  Mở quản lý tài khoản <ArrowRight size={16} />
                </div>
              </div>

              {/* Block 5: Xem báo cáo thống kê */}
              <div
                className="p-6 rounded-xl border space-y-4 hover:border-yellow-500/50 transition-all group cursor-pointer"
                style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }}
                onClick={() => setActiveView("reports")}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-500/10">
                  <BarChart4 size={20} className="text-teal-400" />
                </div>
                <h3 className="font-bold text-lg">Báo cáo & Thống kê</h3>
                <p className="text-sm opacity-60 leading-relaxed">
                  Xem báo cáo thống kê hoạt động trung tâm định kỳ theo biểu mẫu BM3, lọc theo khoảng thời gian.
                </p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-teal-400 group-hover:underline">
                  Mở biểu mẫu báo cáo <ArrowRight size={16} />
                </div>
              </div>

              {/* Block 6: Cấp tài khoản mới */}
              <div
                className="p-6 rounded-xl border space-y-4 hover:border-yellow-500/50 transition-all group cursor-pointer"
                style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }}
                onClick={() => setActiveView("create-account")}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-pink-500/10">
                  <UserPlus size={20} className="text-pink-400" />
                </div>
                <h3 className="font-bold text-lg">Cấp Tài khoản mới</h3>
                <p className="text-sm opacity-60 leading-relaxed">
                  Cấp tài khoản trực tiếp cho Nhân viên quản lý (Staff) và Gia sư (Tutor) tại trung tâm.
                </p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-pink-400 group-hover:underline">
                  Tạo tài khoản mới <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: QUẢN LÝ TÀI KHOẢN (USERS) */}
        {activeView === "users" && (
          <div className="bg-[#1e293b] p-6 rounded-xl border border-[rgba(255,255,255,0.08)] space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Danh sách Tài khoản người dùng</h2>
                <p className="text-xs text-slate-400 mt-1">Biểu mẫu thông tin tài khoản hệ thống (ADMIN_BM1)</p>
              </div>
              <button
                onClick={() => setActiveView("create-account")}
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer self-start"
              >
                <UserPlus size={14} /> Cấp tài khoản mới
              </button>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  className="h-9 rounded pl-9 text-xs bg-[#0f172a] border-slate-700 text-white placeholder-slate-500"
                  placeholder="Tìm theo họ tên, email hoặc SĐT..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />
              </div>

              <div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full h-9 rounded text-xs bg-[#0f172a] border border-slate-700 text-slate-300 px-3 cursor-pointer outline-none"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                  <option value="staff">Nhân viên (Staff)</option>
                  <option value="tutor">Gia sư (Tutor)</option>
                  <option value="student">Học viên (Student)</option>
                </select>
              </div>
            </div>

            {/* Table Users */}
            <div className="overflow-x-auto rounded border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#131d31] text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Họ và tên</th>
                    <th className="px-4 py-3">Email đăng nhập</th>
                    <th className="px-4 py-3">Số điện thoại</th>
                    <th className="px-4 py-3">Vai trò</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#1e293b]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#25354e]/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-white">{u.fullName}</td>
                      <td className="px-4 py-3 text-slate-300">{u.email}</td>
                      <td className="px-4 py-3 text-slate-300">{u.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`rounded font-mono px-2 py-0.5 text-[10px] text-white ${
                            u.role?.name === "admin"
                              ? "bg-purple-900/60 text-purple-200 border-purple-800"
                              : u.role?.name === "staff"
                              ? "bg-yellow-950/60 text-yellow-300 border-yellow-800"
                              : u.role?.name === "tutor"
                              ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                              : "bg-blue-950/60 text-blue-300 border-blue-800"
                          }`}
                        >
                          {u.role?.name.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] ${u.isActive ? "text-emerald-400" : "text-rose-400"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-emerald-400" : "bg-rose-400"}`}></span>
                          {u.isActive ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                          title="Sửa chi tiết"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                          className={`p-1.5 rounded border border-slate-700 bg-slate-800 cursor-pointer ${
                            u.isActive ? "hover:bg-rose-950/30 hover:text-rose-400" : "hover:bg-emerald-950/30 hover:text-emerald-400"
                          }`}
                          title={u.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        >
                          {u.isActive ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-medium">
                        Không tìm thấy tài khoản người dùng nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: PHÊ DUYỆT HỒ SƠ GIA SƯ (TUTORS) */}
        {activeView === "tutors" && (
          <div className="bg-[#1e293b] p-6 rounded-xl border border-[rgba(255,255,255,0.08)] space-y-6">
            <div>
              <h2 className="text-xl font-bold">Danh sách Hồ sơ đăng ký gia sư</h2>
              <p className="text-xs text-slate-400 mt-1">Duyệt và kiểm tra thông tin hồ sơ của gia sư (ADMIN_BM2)</p>
            </div>

            {/* Filter status */}
            <div className="flex gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setFilterTutorStatus("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                  filterTutorStatus === "all" ? "bg-yellow-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Tất cả hồ sơ ({tutors.length})
              </button>
              <button
                onClick={() => setFilterTutorStatus("pending")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                  filterTutorStatus === "pending" ? "bg-yellow-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Chờ duyệt ({tutors.filter((t) => t.approvalStatus === "pending").length})
              </button>
              <button
                onClick={() => setFilterTutorStatus("approved")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                  filterTutorStatus === "approved" ? "bg-yellow-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Đã duyệt ({tutors.filter((t) => t.approvalStatus === "approved").length})
              </button>
              <button
                onClick={() => setFilterTutorStatus("rejected")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                  filterTutorStatus === "rejected" ? "bg-yellow-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Từ chối ({tutors.filter((t) => t.approvalStatus === "rejected").length})
              </button>
            </div>

            {/* Tutor list grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTutors.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#131d31] p-5 rounded-xl border border-slate-800 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-white">{t.user?.fullName}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{t.user?.email}</p>
                      </div>
                      <Badge
                        className={`rounded px-2.5 py-0.5 text-[10px] text-white ${
                          t.approvalStatus === "approved"
                            ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                            : t.approvalStatus === "rejected"
                            ? "bg-rose-950 text-rose-400 border-rose-800"
                            : "bg-amber-950 text-amber-400 border-amber-800 animate-pulse"
                        }`}
                      >
                        {t.approvalStatus === "approved" && "ĐÃ DUYỆT"}
                        {t.approvalStatus === "rejected" && "TỪ CHỐI"}
                        {t.approvalStatus === "pending" && "CHỜ DUYỆT"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-slate-800 pt-3">
                      <div>
                        <span className="text-slate-500">Học vị:</span>
                        <p className="font-semibold text-slate-300">{t.educationLevel || "Chưa cập nhật"}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Chuyên ngành:</span>
                        <p className="font-semibold text-slate-300">{t.major || "Chưa cập nhật"}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Môn giảng dạy:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {t.subjects && t.subjects.map((sub: string) => (
                            <span key={sub} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                              {sub}
                            </span>
                          ))}
                          {(!t.subjects || t.subjects.length === 0) && <span className="text-slate-600 italic">Chưa đăng ký</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                    <span className="text-[10px] text-slate-500">
                      Đăng ký: {new Date(t.user?.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <button
                      onClick={() => setSelectedTutor(t)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={12} /> Xem phiếu duyệt
                    </button>
                  </div>
                </div>
              ))}
              {filteredTutors.length === 0 && (
                <div className="col-span-2 py-8 text-center text-slate-500 font-medium">
                  Không tìm thấy hồ sơ gia sư nào phù hợp.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: QUẢN LÝ MÔN HỌC (SUBJECTS) */}
        {activeView === "subjects" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Create Subject Card */}
            <div className="bg-[#1e293b] p-6 rounded-xl border border-[rgba(255,255,255,0.08)] h-fit space-y-4">
              <div>
                <h3 className="text-base font-bold">Thêm môn học mới</h3>
                <p className="text-xs text-slate-400 mt-0.5">Thêm nhanh môn học trung tâm đang dạy</p>
              </div>

              <form onSubmit={handleCreateSubject} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Tên môn học *</label>
                  <Input
                    className="bg-[#0f172a] border-slate-700 text-xs text-white h-9"
                    placeholder="Ví dụ: Toán, Lý, Tiếng Anh, IELTS..."
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Cấp lớp học</label>
                  <Input
                    className="bg-[#0f172a] border-slate-700 text-xs text-white h-9"
                    placeholder="Ví dụ: Cấp 3, Luyện Thi, Lớp 10..."
                    value={newSubject.gradeLevel}
                    onChange={(e) => setNewSubject({ ...newSubject, gradeLevel: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Mô tả môn học</label>
                  <textarea
                    rows={3}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-md p-2.5 text-xs text-white outline-none placeholder-slate-500 focus:border-yellow-500"
                    placeholder="Mô tả tóm tắt chương trình giảng dạy..."
                    value={newSubject.description}
                    onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Thêm môn học
                </button>
              </form>
            </div>

            {/* Subjects list */}
            <div className="bg-[#1e293b] p-6 rounded-xl border border-[rgba(255,255,255,0.08)] col-span-2 space-y-5">
              <div>
                <h3 className="text-base font-bold">Danh sách môn học giảng dạy</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tổng số môn học hỗ trợ: {subjects.length}</p>
              </div>

              <div className="overflow-x-auto rounded border border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#131d31] text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Tên môn học</th>
                      <th className="px-4 py-3">Cấp lớp</th>
                      <th className="px-4 py-3">Mô tả</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-[#1e293b]">
                    {subjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#25354e]/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-white">{sub.name}</td>
                        <td className="px-4 py-3 text-slate-300">{sub.gradeLevel || "Tất cả"}</td>
                        <td className="px-4 py-3 text-slate-400 truncate max-w-37.5" title={sub.description}>
                          {sub.description || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] ${sub.isActive ? "text-emerald-400" : "text-rose-400"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sub.isActive ? "bg-emerald-400" : "bg-rose-400"}`}></span>
                            {sub.isActive ? "Hoạt động" : "Đã ẩn"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5">
                          <button
                            onClick={() => setEditingSubject(sub)}
                            className="p-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                            title="Sửa"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleToggleSubjectStatus(sub.id, sub.isActive)}
                            className={`p-1.5 rounded border border-slate-700 bg-slate-800 cursor-pointer ${
                              sub.isActive ? "hover:bg-rose-950/30 hover:text-rose-400" : "hover:bg-emerald-950/30 hover:text-emerald-400"
                            }`}
                            title={sub.isActive ? "Ẩn môn học" : "Hiện môn học"}
                          >
                            {sub.isActive ? <Lock size={12} /> : <Unlock size={12} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: THỐNG KÊ & BÁO CÁO (REPORTS) */}
        {activeView === "reports" && (
          <div className="bg-[#1e293b] p-6 rounded-xl border border-[rgba(255,255,255,0.08)] space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BarChart4 size={20} className="text-teal-400" />
                  Báo cáo thống kê hoạt động trung tâm (ADMIN_BM3)
                </h2>
                <p className="text-xs text-slate-400 mt-1">Xuất dữ liệu, thống kê các chỉ số kinh doanh và quy mô trung tâm gia sư</p>
              </div>
              <button
                onClick={printReport}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer self-start"
              >
                <Printer size={14} /> In báo cáo
              </button>
            </div>

            {/* Date range inputs */}
            <div className="bg-[#131d31] p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center gap-4">
              <span className="text-xs font-semibold text-slate-300">Bộ lọc thời gian báo cáo:</span>
              <div className="flex items-center gap-2 flex-1 w-full md:w-auto">
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 block mb-1">Từ ngày</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full h-9 rounded text-xs bg-[#0f172a] border border-slate-700 text-slate-300 px-3 cursor-pointer outline-none focus:border-yellow-500"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 block mb-1">Đến ngày</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full h-9 rounded text-xs bg-[#0f172a] border border-slate-700 text-slate-300 px-3 cursor-pointer outline-none focus:border-yellow-500"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="h-9 px-4 text-xs font-bold border border-slate-700 rounded-lg hover:bg-slate-800 cursor-pointer self-end w-full md:w-auto"
              >
                Xóa lọc
              </button>
            </div>

            {/* BM3 Report Printable Area */}
            <div id="printable-area" className="bg-[#0f172a] p-8 rounded-xl border border-slate-800 space-y-8">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold uppercase tracking-wider text-white">TRUNG TÂM GIA SƯ TUTOREDU</h3>
                <h2 className="text-lg font-extrabold text-yellow-500">BÁO CÁO THỐNG KÊ HOẠT ĐỘNG TRUNG TÂM</h2>
                <p className="text-xs text-slate-400">
                  Thời gian lập thống kê: {fromDate ? new Date(fromDate).toLocaleDateString("vi-VN") : "Toàn thời gian"} đến{" "}
                  {toDate ? new Date(toDate).toLocaleDateString("vi-VN") : "Hiện tại"}
                </p>
              </div>

              {/* Grid 5 metrics */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t border-slate-800">
                <div className="bg-[#1e293b] p-5 rounded-lg border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">STT 1</span>
                  <h4 className="text-xs text-slate-300 font-semibold h-8 flex items-center justify-center">Lớp đang hoạt động</h4>
                  <div className="text-3xl font-extrabold text-yellow-500 pt-2">{stats.activeClasses}</div>
                </div>
                <div className="bg-[#1e293b] p-5 rounded-lg border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">STT 2</span>
                  <h4 className="text-xs text-slate-300 font-semibold h-8 flex items-center justify-center">Lớp hoàn thành</h4>
                  <div className="text-3xl font-extrabold text-green-400 pt-2">{stats.completedClasses}</div>
                </div>
                <div className="bg-[#1e293b] p-5 rounded-lg border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">STT 3</span>
                  <h4 className="text-xs text-slate-300 font-semibold h-8 flex items-center justify-center">Yêu cầu mới trong kỳ</h4>
                  <div className="text-3xl font-extrabold text-blue-400 pt-2">{stats.newRequests}</div>
                </div>
                <div className="bg-[#1e293b] p-5 rounded-lg border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">STT 4</span>
                  <h4 className="text-xs text-slate-300 font-semibold h-8 flex items-center justify-center">Gia sư đang hoạt động</h4>
                  <div className="text-3xl font-extrabold text-purple-400 pt-2">{stats.activeTutors}</div>
                </div>
                <div className="bg-[#1e293b] p-5 rounded-lg border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">STT 5</span>
                  <h4 className="text-xs text-slate-300 font-semibold h-8 flex items-center justify-center">Học viên đang học</h4>
                  <div className="text-3xl font-extrabold text-teal-400 pt-2">{stats.learningStudents}</div>
                </div>
              </div>

              {/* Navigation Blocks - dưới stats grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* Block 1 */}
                <div
                  className="p-6 rounded-xl border space-y-4 hover:border-yellow-500/50 transition-all group cursor-pointer"
                  style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }}
                  onClick={() => router.push("/staff/request-management")}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(245,158,11,0.12)" }}>
                    <Users size={20} className="text-yellow-500" />
                  </div>
                  <h3 className="font-bold text-lg">Quản lý Yêu cầu (Staff)</h3>
                  <p className="text-sm opacity-60 leading-relaxed">
                    Xem danh sách yêu cầu tìm gia sư từ học viên, so khớp và tạo lớp mới.
                  </p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-yellow-500 group-hover:underline">
                    Truy cập quản lý <ArrowRight size={16} />
                  </div>
                </div>

                {/* Block 2 */}
                <div
                  className="p-6 rounded-xl border space-y-4 hover:border-yellow-500/50 transition-all group"
                  style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(59,130,246,0.12)" }}>
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
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(168,85,247,0.12)" }}>
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

              {/* Signatures */}
              <div className="flex items-center justify-between pt-8 border-t border-slate-800 text-xs text-slate-400">
                <span>Ngày lập báo cáo: {reportDate || "..."}</span>
                <div className="text-center space-y-8 pr-8">
                  <span>Người lập báo cáo (Admin)</span>
                  <p className="font-bold text-white text-sm">{user.fullName}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: CẤP TÀI KHOẢN MỚI (CREATE ACCOUNT) */}
        {activeView === "create-account" && (
          <div className="bg-[#1e293b] p-6 rounded-xl border border-[rgba(255,255,255,0.08)] max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UserPlus className="text-pink-400" />
                Cấp và tạo tài khoản trực tiếp
              </h2>
              <p className="text-xs text-slate-400 mt-1">Cấp tài khoản đăng nhập trực tiếp cho Nhân viên quản lý trung tâm hoặc Gia sư</p>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs text-slate-400">Email đăng nhập *</label>
                  <Input
                    type="email"
                    className="bg-[#0f172a] border-slate-700 text-xs text-white h-9"
                    placeholder="staff@tutoredu.com hoặc tutor@tutoredu.com..."
                    value={newAccount.email}
                    onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs text-slate-400">Mật khẩu đăng nhập *</label>
                  <Input
                    type="password"
                    className="bg-[#0f172a] border-slate-700 text-xs text-white h-9"
                    placeholder="Nhập mật khẩu an toàn..."
                    value={newAccount.password}
                    onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs text-slate-400">Họ và tên *</label>
                  <Input
                    className="bg-[#0f172a] border-slate-700 text-xs text-white h-9"
                    placeholder="Ví dụ: Trần Văn Long"
                    value={newAccount.fullName}
                    onChange={(e) => setNewAccount({ ...newAccount, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5 col-span-1">
                  <label className="text-xs text-slate-400">Số điện thoại</label>
                  <Input
                    className="bg-[#0f172a] border-slate-700 text-xs text-white h-9"
                    placeholder="Số điện thoại liên lạc..."
                    value={newAccount.phone}
                    onChange={(e) => setNewAccount({ ...newAccount, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5 col-span-1">
                  <label className="text-xs text-slate-400">Vai trò cấp tài khoản *</label>
                  <select
                    value={newAccount.roleName}
                    onChange={(e) => setNewAccount({ ...newAccount, roleName: e.target.value })}
                    className="w-full h-9 rounded text-xs bg-[#0f172a] border border-slate-700 text-slate-300 px-3 cursor-pointer outline-none"
                    required
                  >
                    <option value="staff">Nhân viên trung tâm (Staff)</option>
                    <option value="tutor">Gia sư giảng dạy (Tutor)</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs text-slate-400">Địa chỉ liên hệ</label>
                  <Input
                    className="bg-[#0f172a] border-slate-700 text-xs text-white h-9"
                    placeholder="Địa chỉ liên hệ thường trú..."
                    value={newAccount.address}
                    onChange={(e) => setNewAccount({ ...newAccount, address: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <UserPlus size={16} /> Xác nhận cấp tài khoản
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ----------------------------------------------------
          MODAL 1: PHIẾU PHÊ DUYỆT GIA SƯ (TUTOR DETAIL)
      ---------------------------------------------------- */}
      {selectedTutor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          onClick={() => setSelectedTutor(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#1e293b] border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-6 p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Phiếu Phê duyệt Hồ sơ gia sư (ADMIN_BM2)
                </h3>
                <p className="text-xs text-slate-400">Xem xét trình độ học vấn, kinh nghiệm giảng dạy và số CCCD</p>
              </div>
              <button
                onClick={() => setSelectedTutor(null)}
                className="p-1 rounded bg-[#0f172a] border border-slate-800 hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500">Họ và tên gia sư:</span>
                <p className="font-semibold text-white">{selectedTutor.user?.fullName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">Số CCCD hợp lệ:</span>
                <p className="font-semibold text-white font-mono">{selectedTutor.idCardNumber || "—"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">Trình độ học vấn:</span>
                <p className="font-semibold text-white">{selectedTutor.educationLevel || "Chưa cập nhật"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">Chuyên ngành học:</span>
                <p className="font-semibold text-white">{selectedTutor.major || "Chưa cập nhật"}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-slate-500">Khu vực đăng ký dạy:</span>
                <p className="font-semibold text-white">{selectedTutor.availableAreas || "Toàn thành phố"}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-slate-500">Môn học đăng ký dạy:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTutor.subjects && selectedTutor.subjects.map((sub: string) => (
                    <span key={sub} className="px-1.5 py-0.5 rounded bg-[#0f172a] text-[10px] text-yellow-500 border border-slate-800">
                      {sub}
                    </span>
                  ))}
                  {(!selectedTutor.subjects || selectedTutor.subjects.length === 0) && <span className="text-slate-600 italic text-[11px]">Chưa đăng ký</span>}
                </div>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-slate-500">Kinh nghiệm giảng dạy (mô tả chi tiết):</span>
                <p className="bg-[#0f172a] p-3 rounded-lg border border-slate-800 text-slate-300 leading-relaxed max-h-28 overflow-y-auto">
                  {selectedTutor.experience || "Không có thông tin mô tả chi tiết kinh nghiệm giảng dạy."}
                </p>
              </div>

              {/* CV Download */}
              <div className="col-span-2">
                <div className="bg-[#0f172a] p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-xs">CV / Bằng cấp, chứng chỉ đính kèm:</span>
                  <div className="mt-2">
                    {selectedTutor.cvUrl ? (
                      <a
                        href={selectedTutor.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors hover:bg-yellow-500/10 hover:border-yellow-500/50"
                        style={{
                          borderColor: "rgba(255,255,255,0.15)",
                          color: "#fbbf24",
                        }}
                      >
                        <FileText size={16} />
                        Xem CV / Chứng chỉ
                        <span className="text-[10px] text-slate-400 ml-1">(Mở tab mới)</span>
                      </a>
                    ) : (
                      <span className="text-slate-600 italic text-[11px]">Không có file đính kèm</span>
                    )}
                  </div>
                </div>
              </div>
              {selectedTutor.approvedBy && (
                <div className="col-span-2 bg-[#0f172a] p-3 rounded-lg border border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>
                    <span>Người phê duyệt:</span>
                    <p className="font-bold text-slate-300">{selectedTutor.approvedBy?.fullName}</p>
                  </div>
                  <div>
                    <span>Ngày phê duyệt:</span>
                    <p className="font-bold text-slate-300">
                      {new Date(selectedTutor.approvedAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Approval Controls */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedTutor(null)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Hủy bỏ
              </button>
              {selectedTutor.approvalStatus !== "rejected" && (
                <button
                  onClick={() => handleApproveTutor(selectedTutor.id, "rejected")}
                  className="bg-rose-900/40 hover:bg-rose-900 text-rose-300 border border-rose-800 hover:border-rose-600 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Từ chối hồ sơ
                </button>
              )}
              {selectedTutor.approvalStatus !== "approved" && (
                <button
                  onClick={() => handleApproveTutor(selectedTutor.id, "approved")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold px-5 py-2 rounded-lg cursor-pointer"
                >
                  Phê duyệt
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL 2: CHỈNH SỬA TÀI KHOẢN (USER EDIT)
      ---------------------------------------------------- */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="w-full max-w-md bg-[#1e293b] border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-base font-bold text-white">Chỉnh sửa thông tin tài khoản</h3>
              <p className="text-xs text-slate-400">Thay đổi thông tin liên lạc hoặc vai trò (BM1)</p>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400">Họ và tên</label>
                  <Input
                    className="bg-[#0f172a] border-slate-700 text-white h-9"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Email đăng nhập</label>
                  <Input
                    type="email"
                    className="bg-[#0f172a] border-slate-700 text-white h-9"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Số điện thoại</label>
                  <Input
                    className="bg-[#0f172a] border-slate-700 text-white h-9"
                    value={editingUser.phone || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Địa chỉ thường trú</label>
                  <Input
                    className="bg-[#0f172a] border-slate-700 text-white h-9"
                    value={editingUser.address || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Vai trò</label>
                  <select
                    value={editingUser.roleName || editingUser.role?.name}
                    onChange={(e) => setEditingUser({ ...editingUser, roleName: e.target.value })}
                    className="w-full h-9 rounded bg-[#0f172a] border border-slate-700 text-slate-300 px-3 cursor-pointer outline-none"
                  >
                    <option value="admin">Quản trị viên (Admin)</option>
                    <option value="staff">Nhân viên trung tâm (Staff)</option>
                    <option value="tutor">Gia sư (Tutor)</option>
                    <option value="student">Học viên (Student)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    checked={editingUser.isActive}
                    onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                    className="accent-yellow-500 w-4 h-4 cursor-pointer"
                    id="isActiveCheckbox"
                  />
                  <label htmlFor="isActiveCheckbox" className="text-slate-300 cursor-pointer font-semibold">
                    Kích hoạt tài khoản này hoạt động
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL 3: CHỈNH SỬA MÔN HỌC (SUBJECT EDIT)
      ---------------------------------------------------- */}
      {editingSubject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          onClick={() => setEditingSubject(null)}
        >
          <div
            className="w-full max-w-md bg-[#1e293b] border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-base font-bold text-white">Chỉnh sửa môn học</h3>
              <p className="text-xs text-slate-400">Thay đổi thông tin môn học giảng dạy</p>
            </div>

            <form onSubmit={handleUpdateSubject} className="space-y-4">
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400">Tên môn học *</label>
                  <Input
                    className="bg-[#0f172a] border-slate-700 text-white h-9"
                    value={editingSubject.name}
                    onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Cấp lớp</label>
                  <Input
                    className="bg-[#0f172a] border-slate-700 text-white h-9"
                    value={editingSubject.gradeLevel || ""}
                    onChange={(e) => setEditingSubject({ ...editingSubject, gradeLevel: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Mô tả môn học</label>
                  <textarea
                    rows={3}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-md p-2.5 text-xs text-white outline-none focus:border-yellow-500"
                    value={editingSubject.description || ""}
                    onChange={(e) => setEditingSubject({ ...editingSubject, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    checked={editingSubject.isActive}
                    onChange={(e) => setEditingSubject({ ...editingSubject, isActive: e.target.checked })}
                    className="accent-yellow-500 w-4 h-4 cursor-pointer"
                    id="isActiveSubCheckbox"
                  />
                  <label htmlFor="isActiveSubCheckbox" className="text-slate-300 cursor-pointer font-semibold">
                    Kích hoạt môn học hoạt động
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

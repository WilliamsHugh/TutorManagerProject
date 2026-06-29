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
  Plus,
  Edit2,
  Lock,
  Unlock,
  Eye,
  BarChart4,
  Printer,
  ChevronLeft,
  Search,
  RotateCw,
  Trash2,
} from "lucide-react";
import { saveAuth, clearAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";
import { TablePagination } from "@/app/(hub)/staff/_components/TablePagination";

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

function MiniListSkeleton() {
  return (
    <div className="animate-pulse space-y-2 py-1 select-none w-full">
      <div className="h-7 bg-slate-800/80 rounded w-full border border-white/5" />
      <div className="h-7 bg-slate-800/80 rounded w-full border border-white/5" />
      <div className="h-7 bg-slate-800/80 rounded w-full border border-white/5" />
    </div>
  );
}

type ViewType = "dashboard" | "users" | "tutors" | "subjects" | "create-account" | "system-logs";

export default function AdminDashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("dashboard");

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

  // Filter & Search States
  const [searchUser, setSearchUser] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterTutorStatus, setFilterTutorStatus] = useState("all");

  // Pagination States
  const [usersPage, setUsersPage] = useState(1);
  const usersPageSize = 5;

  const [tutorsPage, setTutorsPage] = useState(1);
  const tutorsPageSize = 4;

  const [subjectsPage, setSubjectsPage] = useState(1);
  const subjectsPageSize = 5;

  useEffect(() => {
    setUsersPage(1);
  }, [searchUser, filterRole]);

  useEffect(() => {
    setTutorsPage(1);
  }, [filterTutorStatus]);
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

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice((usersPage - 1) * usersPageSize, usersPage * usersPageSize);
  }, [filteredUsers, usersPage]);

  const paginatedTutors = useMemo(() => {
    return filteredTutors.slice((tutorsPage - 1) * tutorsPageSize, tutorsPage * tutorsPageSize);
  }, [filteredTutors, tutorsPage]);

  const paginatedSubjects = useMemo(() => {
    return subjects.slice((subjectsPage - 1) * subjectsPageSize, subjectsPage * subjectsPageSize);
  }, [subjects, subjectsPage]);

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
                    Chào mừng trở lại, {user.fullName}!
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
                onClick={() => setActiveView("tutors")}
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
                              setSelectedTutor(t);
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
                onClick={() => setActiveView("subjects")}
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
                              setEditingSubject(sub);
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
                onClick={() => setActiveView("users")}
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
                              setEditingUser(u);
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

              {/* Block 6: Cấp tài khoản mới */}
              <div
                className="p-6 rounded-xl border space-y-4 hover:border-pink-500/40 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(244,63,94,0.1)] transition-all duration-300 ease-out group cursor-pointer stagger-item"
                style={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.08)", animationDelay: "240ms" }}
                onClick={() => setActiveView("create-account")}
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
                            setFilterRole(item.roleName);
                            setActiveView("users");
                          }}
                        >
                          <span className="font-semibold text-slate-200">{item.role}</span>
                          <span className="text-[9px] text-pink-400 font-bold bg-pink-500/10 border border-pink-500/20 px-1.5 rounded uppercase">{item.count} TK</span>
                        </div>
                      ))}
                      {[
                        { role: "Quản trị viên (Admin)", count: users.filter(u => u.role?.name === "admin").length, roleName: "admin" },
                        { role: "Nhân viên (Staff)", count: users.filter(u => u.role?.name === "staff").length, roleName: "staff" },
                        { role: "Gia sư (Tutor)", count: users.filter(u => u.role?.name === "tutor").length, roleName: "tutor" },
                        { role: "Học viên (Student)", count: users.filter(u => u.role?.name === "student").length, roleName: "student" },
                      ].map((item, idx) => (
                        <div
                          key={`dup-${idx}`}
                          className="flex justify-between items-center bg-[#131d31]/50 px-2 py-1.5 rounded border border-white/5 cursor-pointer hover:bg-slate-700/60 hover:text-white hover:border-pink-500/30 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilterRole(item.roleName);
                            setActiveView("users");
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
                  <span>Tạo tài khoản mới</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: QUẢN LÝ TÀI KHOẢN (USERS) */}
        {activeView === "users" && (
          isLoadingUsers ? (
            <TableSkeleton cols={5} rows={6} />
          ) : (
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
                  className="w-full h-9 rounded text-xs bg-[#0f172a] border border-slate-700 text-slate-300 px-3 cursor-pointer outline-none custom-select"
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
                  {paginatedUsers.map((u, idx) => (
                    <tr
                      key={u.id}
                      className="hover:bg-[#25354e]/40 transition-colors stagger-item"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
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
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-rose-950/30 hover:text-rose-400 text-slate-300 cursor-pointer"
                          title="Xóa tài khoản"
                        >
                          <Trash2 size={12} />
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
            {filteredUsers.length > usersPageSize && (
              <TablePagination
                currentPage={usersPage}
                totalItems={filteredUsers.length}
                pageSize={usersPageSize}
                onPageChange={setUsersPage}
                itemName="tài khoản"
              />
            )}
          </div>
          )
        )}

        {/* VIEW 3: PHÊ DUYỆT HỒ SƠ GIA SƯ (TUTORS) */}
        {activeView === "tutors" && (
          isLoadingTutors ? (
            <TableSkeleton cols={5} rows={6} />
          ) : (
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
              {paginatedTutors.map((t, idx) => (
                <div
                  key={t.id}
                  className="bg-[#131d31] p-5 rounded-xl border border-slate-800 flex flex-col justify-between gap-4 stagger-item"
                  style={{ animationDelay: `${idx * 50}ms` }}
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
              {filteredTutors.length > tutorsPageSize && (
                <div className="col-span-2 mt-2">
                  <TablePagination
                    currentPage={tutorsPage}
                    totalItems={filteredTutors.length}
                    pageSize={tutorsPageSize}
                    onPageChange={setTutorsPage}
                    itemName="hồ sơ gia sư"
                  />
                </div>
              )}
            </div>
          </div>
          )
        )}

        {/* VIEW 4: QUẢN LÝ MÔN HỌC (SUBJECTS) */}
        {activeView === "subjects" && (
          isLoadingSubjects ? (
            <TableSkeleton cols={5} rows={6} />
          ) : (
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
                    {paginatedSubjects.map((sub, idx) => (
                      <tr
                        key={sub.id}
                        className="hover:bg-[#25354e]/40 transition-colors stagger-item"
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
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
              {subjects.length > subjectsPageSize && (
                <TablePagination
                  currentPage={subjectsPage}
                  totalItems={subjects.length}
                  pageSize={subjectsPageSize}
                  onPageChange={setSubjectsPage}
                  itemName="môn học"
                />
              )}
            </div>
          </div>
          )
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
                    className="w-full h-9 rounded text-xs bg-[#0f172a] border border-slate-700 text-slate-300 px-3 cursor-pointer outline-none custom-select"
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

        {/* VIEW 7: NHẬT KÝ HỆ THỐNG (SYSTEM LOGS) */}
        {activeView === "system-logs" && (
          isLoadingLogs ? (
            <TableSkeleton cols={6} rows={6} />
          ) : (
            <div className="bg-[#1e293b] p-6 rounded-xl border border-[rgba(255,255,255,0.08)] space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Settings className="text-yellow-500" />
                  Nhật ký hoạt động hệ thống
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Danh sách ghi nhận các hành vi thay đổi dữ liệu, đăng nhập và tác vụ quản trị
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm hành động, route, user..."
                    className="pl-8 pr-3 h-9 rounded bg-[#0f172a] border border-slate-700 text-xs text-slate-200 outline-none w-56 focus:border-yellow-500 transition-colors"
                    value={logsSearch}
                    onChange={(e) => {
                      setLogsSearch(e.target.value);
                      setLogsPage(1);
                    }}
                  />
                </div>

                {/* Action Filter */}
                <select
                  value={logsActionFilter}
                  onChange={(e) => {
                    setLogsActionFilter(e.target.value);
                    setLogsPage(1);
                  }}
                  className="h-9 rounded bg-[#0f172a] border border-slate-700 text-xs text-slate-300 px-3 cursor-pointer outline-none custom-select"
                >
                  <option value="">Tất cả hoạt động</option>
                  <option value="Đăng nhập">Đăng nhập</option>
                  <option value="Đăng ký tài khoản">Đăng ký tài khoản</option>
                  <option value="Cấp tài khoản mới">Cấp tài khoản mới</option>
                  <option value="Cập nhật trạng thái tài khoản">Cập nhật trạng thái tài khoản</option>
                  <option value="Phê duyệt hồ sơ Gia sư">Phê duyệt hồ sơ Gia sư</option>
                  <option value="Thêm môn học mới">Thêm môn học mới</option>
                  <option value="Cập nhật môn học">Cập nhật môn học</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-white/5 rounded-lg bg-black/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/5">
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Người thực hiện</th>
                    <th className="py-3 px-4">Hành động</th>
                    <th className="py-3 px-4">Phương thức</th>
                    <th className="py-3 px-4">Đường dẫn (Route)</th>
                    <th className="py-3 px-4">Địa chỉ IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {systemLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {new Date(log.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                      </td>
                      <td className="py-3 px-4">
                        {log.user ? (
                          <div>
                            <div className="font-semibold text-white">{log.user.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{log.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Khách (Guest)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-yellow-400">
                        {log.action}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.method === "POST" ? "bg-green-500/10 text-green-400" :
                          log.method === "PUT" ? "bg-blue-500/10 text-blue-400" :
                          log.method === "PATCH" ? "bg-amber-500/10 text-amber-400" :
                          log.method === "DELETE" ? "bg-red-500/10 text-red-400" : "bg-slate-800 text-slate-400"
                        }`}>
                          {log.method || "GET"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300 text-[11px] max-w-[200px] truncate" title={log.route}>
                        {log.route}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {log.ipAddress || "—"}
                      </td>
                    </tr>
                  ))}
                  {systemLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        Chưa có lịch sử nhật ký hoạt động nào được ghi nhận.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {logsTotal > logsLimit && (
              <div className="pt-2">
                <TablePagination
                  currentPage={logsPage}
                  totalItems={logsTotal}
                  pageSize={logsLimit}
                  onPageChange={(page) => setLogsPage(page)}
                  itemName="nhật ký"
                />
              </div>
            )}
          </div>
          )
        )}
          </div>
        </div>
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
                      {new Date(selectedTutor.approvedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Approval Controls */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => handleDeleteTutor(selectedTutor.user?.id)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer mr-auto"
              >
                Xóa vĩnh viễn
              </button>
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
                    className="w-full h-9 rounded bg-[#0f172a] border border-slate-700 text-slate-300 px-3 cursor-pointer outline-none custom-select"
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

      {/* ----------------------------------------------------
          MODAL 4: CHI TIẾT NHẬT KÝ HỆ THỐNG (LOG DETAIL)
      ---------------------------------------------------- */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#1e293b] border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-5 p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Chi tiết hoạt động hệ thống
                </h3>
                <p className="text-xs text-slate-400">Xem thông tin chi tiết về tác vụ và thông tin người thực hiện</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded bg-[#0f172a] border border-slate-800 hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <XCircle size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Left Column: User details */}
              <div className="space-y-4 border-r border-slate-800 pr-4">
                <h4 className="font-bold text-yellow-500 uppercase tracking-wider text-[10px]">Người thực hiện (User)</h4>
                
                {selectedLog.user ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-slate-500">Họ và tên:</span>
                      <p className="font-semibold text-white text-sm">{selectedLog.user.fullName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500">Email hệ thống:</span>
                      <p className="font-semibold text-white font-mono">{selectedLog.user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500">Vai trò (Role):</span>
                      <p className="font-semibold text-white capitalize">{selectedLog.user.role?.name || "Thành viên"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500">Mã định danh User ID:</span>
                      <p className="font-mono text-slate-400 text-[10px] select-all bg-black/30 p-1 rounded border border-white/5 truncate">{selectedLog.user.id}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500 italic">
                    Tác vụ được thực hiện bởi Khách chưa đăng nhập (Guest)
                  </div>
                )}
              </div>

              {/* Right Column: Log details */}
              <div className="space-y-4 pl-2">
                <h4 className="font-bold text-yellow-500 uppercase tracking-wider text-[10px]">Thông tin kỹ thuật tác vụ</h4>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-slate-500">Hành động:</span>
                    <p className="font-semibold text-white">{selectedLog.action}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500">Đường dẫn Route:</span>
                    <p className="font-mono text-slate-300 bg-black/30 p-1.5 rounded border border-white/5 text-[10px] break-all">{selectedLog.method || "GET"} {selectedLog.route}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500">Thời gian ghi nhận:</span>
                    <p className="font-semibold text-white">{new Date(selectedLog.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500">Địa chỉ IP khách:</span>
                    <p className="font-semibold text-white font-mono">{selectedLog.ipAddress || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500">Trình duyệt/Thiết bị (User Agent):</span>
                    <p className="text-[10px] text-slate-400 font-mono break-words leading-normal max-h-[60px] overflow-y-auto bg-black/20 p-1 rounded border border-white/5">{selectedLog.userAgent || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Details body JSON */}
              {selectedLog.details && (
                <div className="col-span-2 space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Dữ liệu yêu cầu gửi kèm (Body/Details JSON):</span>
                  <pre className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-[10px] text-green-400 font-mono overflow-auto max-h-[140px] select-all leading-normal">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
              >
                Đóng chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

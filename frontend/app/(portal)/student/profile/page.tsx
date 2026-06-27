"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUserRole, clearAuth } from "@/lib/auth";
import { ProfileSkeleton } from "../_components/StudentSkeletons";
import { getStudentProfile } from "@/lib/api/classes.api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Save,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Upload,
} from "lucide-react";

interface StudentData {
  id: string;
  gradeLevel: string;
  schoolName: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    avatarUrl: string;
  };
}

export default function StudentProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const loggedIn = isLoggedIn();
  const userRole = getUserRole();

  useEffect(() => {
    if (!loggedIn || userRole !== "student") {
      clearAuth();
      window.location.replace("/login");
      return;
    }

    loadProfile();
  }, [loggedIn, userRole, router]);

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStudentProfile();
      setStudent(data);
      setFullName(data.user?.fullName || "");
      setPhone(data.user?.phone || "");
      setAddress(data.user?.address || "");
    } catch (err: any) {
      setError(err.message || "Không thể tải thông tin hồ sơ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setSaveError("File ảnh phải nhỏ hơn 5MB");
      return;
    }

    // Validate file type
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      setSaveError("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)");
      return;
    }

    setUploadingAvatar(true);
    setSaveError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.message || "Tải ảnh lên thất bại");
      }

      const { url } = await uploadRes.json();

      // Update avatar URL via profile endpoint
      const profileRes = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ avatarUrl: url }),
      });

      if (!profileRes.ok) {
        throw new Error("Không thể cập nhật ảnh đại diện");
      }

      // Refresh profile to show new avatar
      await loadProfile();
    } catch (err: any) {
      setSaveError(err.message || "Có lỗi xảy ra khi tải ảnh lên");
    } finally {
      setUploadingAvatar(false);
      // Reset file input so re-selecting the same file works
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName,
          phone,
          address: address || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Không thể cập nhật hồ sơ");
      }

      setSaveSuccess(true);
      loadProfile();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Có lỗi xảy ra khi cập nhật");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      {isLoading ? (
        <ProfileSkeleton />
      ) : error ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-sm">
            <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0f172a] mb-2">Đã xảy ra lỗi</h3>
            <p className="text-sm text-[#64748b] mb-4">{error}</p>
            <button
              onClick={loadProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b5fff] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all"
            >
              Thử lại
            </button>
          </div>
        </div>
      ) : (<>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Top Bar */}
      <div className="border-b border-[#e2e8f0] bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/student")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>
          <h1 className="text-lg font-bold text-[#0f172a]">Cài đặt hồ sơ</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 text-center shadow-sm sticky top-24">
              <div className="relative mx-auto w-28 h-28 mb-4">
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center" style={{ background: student?.user?.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #0b5fff, #6366f1)' }}>
                  {student?.user?.avatarUrl ? (
                    <img
                      src={student.user.avatarUrl}
                      alt={student.user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-white/90">{(student?.user?.fullName || student?.user?.email || '?').charAt(0).toUpperCase()}</span>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                      <Loader2 size={24} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white border-2 border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:text-[#0b5fff] hover:border-[#0b5fff] transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Upload size={16} />
                </button>
              </div>
              <h2 className="text-lg font-bold text-[#0f172a]">{student?.user?.fullName}</h2>
              <p className="text-sm text-[#64748b] mt-0.5">{student?.user?.email}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#0b5fff]/10 px-3 py-1 text-xs font-semibold text-[#0b5fff]">
                <GraduationCap size={14} />
                Học viên
              </div>
              <p className="text-[11px] text-[#94a3b8] mt-3">Nhấn vào icon upload để thay đổi ảnh đại diện</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Success/Error Messages */}
            {saveSuccess && (
              <div className="flex items-center gap-2.5 rounded-xl border border-[#bbf7d0] bg-[#dcfce7] px-4 py-3 text-sm font-medium text-[#166534]">
                <CheckCircle2 size={18} />
                Cập nhật hồ sơ thành công!
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-2.5 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-medium text-[#991b1b]">
                <AlertCircle size={18} />
                {saveError}
              </div>
            )}

            {/* Thông tin cá nhân */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
              <h3 className="text-base font-bold text-[#0f172a] mb-5 flex items-center gap-2">
                <User size={18} className="text-[#0b5fff]" />
                Thông tin cá nhân
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1.5">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-11 rounded-xl border border-[#e2e8f0] bg-white pl-10 pr-3 text-sm text-[#0f172a] outline-none focus:border-[#0b5fff] focus:ring-2 focus:ring-[#0b5fff]/10 transition-all"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                    <input
                      type="email"
                      value={student?.user?.email || ""}
                      disabled
                      className="w-full h-11 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] pl-10 pr-3 text-sm text-[#94a3b8] outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1.5">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 rounded-xl border border-[#e2e8f0] bg-white pl-10 pr-3 text-sm text-[#0f172a] outline-none focus:border-[#0b5fff] focus:ring-2 focus:ring-[#0b5fff]/10 transition-all"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1.5">
                    Địa chỉ
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full h-11 rounded-xl border border-[#e2e8f0] bg-white pl-10 pr-3 text-sm text-[#0f172a] outline-none focus:border-[#0b5fff] focus:ring-2 focus:ring-[#0b5fff]/10 transition-all"
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => router.push("/student")}
                className="h-11 rounded-xl border border-[#e2e8f0] bg-white px-6 text-sm font-semibold text-[#475569] hover:bg-slate-50 transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b5fff] px-6 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all shadow-md shadow-blue-200 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      </>
    )}
    </div>
  );
}

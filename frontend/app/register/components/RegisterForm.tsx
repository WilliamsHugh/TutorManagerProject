"use client";

import {
    BookOpen,
    Search,
    CheckCircle2,
    UserCircle,
    Briefcase,
    UploadCloud,
    Trash2,
    X,
    ChevronDown,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const subjects = [
    "Toán Cấp 3",
    "Luyện thi ĐH",
    "Vật Lý 12",
    "Hóa Học",
    "Tiếng Anh",
];

export default function RegisterForm() {
    const [selectedRole, setSelectedRole] = useState<"student" | "tutor">("tutor");
    const [subjects_selected, setSubjectsSelected] = useState([
        "Toán Cấp 3",
        "Luyện thi ĐH",
        "Vật Lý 12",
    ]);
    const [file, setFile] = useState<string | null>("Bang_Tot_Nghiep_DH.pdf");

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [education, setEducation] = useState("Sinh viên");
    const [experience, setExperience] = useState("1 - 3 năm");
    
    const [subjectInput, setSubjectInput] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubjectKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const val = subjectInput.trim();
            if (val && !subjects_selected.includes(val)) {
                setSubjectsSelected([...subjects_selected, val]);
                setSubjectInput("");
            }
        }
    };

    const removeSubject = (subject: string) => {
        setSubjectsSelected(subjects_selected.filter((s) => s !== subject));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const endpoint = selectedRole === "student"
            ? "http://localhost:3001/api/auth/register/student"
            : "http://localhost:3001/api/auth/register/tutor";

        const payload: any = {
            fullName,
            email,
            phone,
            password
        };

        if (selectedRole === "tutor") {
            payload.education = education;
            payload.experience = experience;
            payload.subjects = subjects_selected;
        }

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                if (Array.isArray(data.message)) {
                    setError(data.message.join(", "));
                } else {
                    setError(data.message || "Đăng ký thất bại");
                }
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError("Đã có lỗi xảy ra. Không thể kết nối tới server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            className="flex-1 flex flex-col px-6 sm:px-12 py-8 sm:py-10 overflow-y-auto"
            style={{ backgroundColor: "var(--background)" }}
        >
            {/* Header Links */}
            <div className="flex justify-end mb-12 text-sm" style={{ color: "var(--muted-foreground)" }}>
                Đã có tài khoản?
                <Link
                    href="/login"
                    className="ml-1.5 font-semibold no-underline"
                    style={{ color: "var(--primary)" }}
                >
                    Đăng nhập
                </Link>
            </div>

            {/* Form Container */}
            <div className="w-full max-w-2xl mx-auto pb-12">
                {/* Title */}
                <h1
                    className="text-3xl sm:text-4xl font-bold mb-2"
                    style={{ color: "var(--foreground)" }}
                >
                    Đăng ký tài khoản
                </h1>
                <p
                    className="text-base mb-8"
                    style={{ color: "var(--muted-foreground)" }}
                >
                    Bạn là ai? Hãy chọn vai trò để bắt đầu.
                </p>

                {/* Role Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {/* Student Role */}
                    <button
                        onClick={() => setSelectedRole("student")}
                        className="relative p-5 rounded-lg border text-left transition-all"
                        style={{
                            backgroundColor: selectedRole === "student" ? "#eff6ff" : "var(--card)",
                            borderColor: selectedRole === "student" ? "var(--primary)" : "var(--border)",
                            borderWidth: selectedRole === "student" ? "2px" : "1px",
                        }}
                    >
                        <div className="flex items-start gap-3.5">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{
                                    backgroundColor: selectedRole === "student" ? "var(--primary)" : "var(--muted)",
                                    color: selectedRole === "student" ? "white" : "var(--muted-foreground)",
                                }}
                            >
                                <Search size={22} />
                            </div>
                            <div>
                                <h3
                                    className="text-base font-semibold mb-1"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Tôi muốn tìm gia sư
                                </h3>
                                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                                    Dành cho học viên &amp; phụ huynh
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Tutor Role */}
                    <button
                        onClick={() => setSelectedRole("tutor")}
                        className="relative p-5 rounded-lg border text-left transition-all"
                        style={{
                            backgroundColor: selectedRole === "tutor" ? "#eff6ff" : "var(--card)",
                            borderColor: selectedRole === "tutor" ? "var(--primary)" : "var(--border)",
                            borderWidth: selectedRole === "tutor" ? "2px" : "1px",
                        }}
                    >
                        <div className="flex items-start gap-3.5">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{
                                    backgroundColor: selectedRole === "tutor" ? "var(--primary)" : "var(--muted)",
                                    color: selectedRole === "tutor" ? "white" : "var(--muted-foreground)",
                                }}
                            >
                                <BookOpen size={22} />
                            </div>
                            <div>
                                <h3
                                    className="text-base font-semibold mb-1"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Tôi muốn trở thành gia sư
                                </h3>
                                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                                    Dành cho giáo viên &amp; sinh viên
                                </p>
                            </div>
                            {selectedRole === "tutor" && (
                                <div
                                    className="absolute top-4 right-4"
                                    style={{ color: "var(--primary)" }}
                                >
                                    <CheckCircle2 size={20} />
                                </div>
                            )}
                        </div>
                    </button>
                </div>

                {/* Form */}
                {success ? (
                    <div className="p-6 rounded-lg border text-center space-y-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-green-100 text-green-600 mb-4">
                            <CheckCircle2 size={28} />
                        </div>
                        <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Đăng ký thành công!</h3>
                        <p style={{ color: 'var(--muted-foreground)' }}>Tuyệt vời! Tài khoản của bạn đã được tạo.</p>
                        <Link href="/login" className="inline-flex items-center justify-center h-10 px-6 rounded-lg font-semibold border-none cursor-pointer transition-opacity hover:opacity-90 mt-4" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', textDecoration: 'none' }}>
                            Đến trang Đăng nhập
                        </Link>
                    </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="p-4 rounded-md text-sm font-medium" style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
                            {error}
                        </div>
                    )}
                    {/* Section 1: Basic Info */}
                    <div>
                        <div
                            className="flex items-center gap-2.5 text-base font-semibold mb-5 pb-3 border-b"
                            style={{
                                color: "var(--foreground)",
                                borderColor: "var(--border)",
                            }}
                        >
                            <UserCircle size={20} style={{ color: "var(--primary)" }} />
                            Thông tin cơ bản
                        </div>

                        <div className="space-y-5">
                            {/* Full Name - Full Width */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                    Họ và tên <span style={{ color: "var(--destructive)" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    placeholder="Nhập đầy đủ họ và tên của bạn"
                                    className="w-full h-11 px-3.5 rounded-md border text-sm outline-none transition-colors focus:ring-2"
                                    style={{
                                        borderColor: "var(--border)",
                                        backgroundColor: "var(--card)",
                                        color: "var(--foreground)",
                                        "--tw-ring-color": "var(--primary)",
                                    } as React.CSSProperties}
                                />
                            </div>

                            {/* Email and Phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                        Email <span style={{ color: "var(--destructive)" }}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="you@example.com"
                                        className="w-full h-11 px-3.5 rounded-md border text-sm outline-none transition-colors focus:ring-2"
                                        style={{
                                            borderColor: "var(--border)",
                                            backgroundColor: "var(--card)",
                                            color: "var(--foreground)",
                                            "--tw-ring-color": "var(--primary)",
                                        } as React.CSSProperties}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                        Số điện thoại <span style={{ color: "var(--destructive)" }}>*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        placeholder="09xx xxx xxx"
                                        className="w-full h-11 px-3.5 rounded-md border text-sm outline-none transition-colors focus:ring-2"
                                        style={{
                                            borderColor: "var(--border)",
                                            backgroundColor: "var(--card)",
                                            color: "var(--foreground)",
                                            "--tw-ring-color": "var(--primary)",
                                        } as React.CSSProperties}
                                    />
                                </div>
                            </div>

                            {/* Password - Full Width */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                    Mật khẩu <span style={{ color: "var(--destructive)" }}>*</span>
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Tối thiểu 8 ký tự"
                                    className="w-full h-11 px-3.5 rounded-md border text-sm outline-none transition-colors focus:ring-2"
                                    style={{
                                        borderColor: "var(--border)",
                                        backgroundColor: "var(--card)",
                                        color: "var(--foreground)",
                                        "--tw-ring-color": "var(--primary)",
                                    } as React.CSSProperties}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Professional Info (Tutor Only) */}
                    {selectedRole === "tutor" && (
                        <div>
                            <div
                                className="flex items-center gap-2.5 text-base font-semibold mb-5 pb-3 border-b"
                                style={{
                                    color: "var(--foreground)",
                                    borderColor: "var(--border)",
                                }}
                            >
                                <Briefcase size={20} style={{ color: "var(--primary)" }} />
                                Hồ sơ chuyên môn (Dành cho gia sư)
                            </div>

                            <div className="space-y-5">
                                {/* Education and Experience */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                            Trình độ học vấn <span style={{ color: "var(--destructive)" }}>*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={education}
                                                onChange={(e) => setEducation(e.target.value)}
                                                className="w-full h-11 px-3.5 pr-10 rounded-md border text-sm appearance-none outline-none transition-colors focus:ring-2"
                                                style={{
                                                    borderColor: "var(--border)",
                                                    backgroundColor: "var(--card)",
                                                    color: "var(--foreground)",
                                                    "--tw-ring-color": "var(--primary)",
                                                } as React.CSSProperties}
                                            >
                                                <option value="">Chọn trình độ...</option>
                                                <option value="Sinh viên">Sinh viên</option>
                                                <option value="Cử nhân">Cử nhân</option>
                                                <option value="Thạc sĩ">Thạc sĩ</option>
                                                <option value="Giáo viên">Giáo viên</option>
                                                <option value="Chuyên gia">Chuyên gia</option>
                                            </select>
                                            <ChevronDown
                                                size={18}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                                style={{ color: "var(--muted-foreground)" }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                            Kinh nghiệm giảng dạy <span style={{ color: "var(--destructive)" }}>*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={experience}
                                                onChange={(e) => setExperience(e.target.value)}
                                                className="w-full h-11 px-3.5 pr-10 rounded-md border text-sm appearance-none outline-none transition-colors focus:ring-2"
                                                style={{
                                                    borderColor: "var(--border)",
                                                    backgroundColor: "var(--card)",
                                                    color: "var(--foreground)",
                                                    "--tw-ring-color": "var(--primary)",
                                                } as React.CSSProperties}
                                            >
                                                <option value="">Chọn số năm...</option>
                                                <option value="Chưa có kinh nghiệm">Chưa có kinh nghiệm</option>
                                                <option value="Dưới 1 năm">Dưới 1 năm</option>
                                                <option value="1 - 3 năm">1 - 3 năm</option>
                                                <option value="Trên 3 năm">Trên 3 năm</option>
                                            </select>
                                            <ChevronDown
                                                size={18}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                                style={{ color: "var(--muted-foreground)" }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Subjects - Full Width */}
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                        Các môn có thể dạy <span style={{ color: "var(--destructive)" }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={subjectInput}
                                        onChange={(e) => setSubjectInput(e.target.value)}
                                        onKeyDown={handleSubjectKeyDown}
                                        placeholder="Nhập môn học và ấn Enter..."
                                        className="w-full h-11 px-3.5 rounded-md border text-sm outline-none transition-colors focus:ring-2"
                                        style={{
                                            borderColor: "var(--border)",
                                            backgroundColor: "var(--card)",
                                            color: "var(--foreground)",
                                            "--tw-ring-color": "var(--primary)",
                                        } as React.CSSProperties}
                                    />
                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {subjects_selected.map((subject) => (
                                            <span
                                                key={subject}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                                                style={{
                                                    backgroundColor: "var(--muted)",
                                                    color: "var(--foreground)",
                                                }}
                                            >
                                                {subject}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSubject(subject)}
                                                    className="border-none bg-transparent cursor-pointer p-0"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Certificate Upload - Full Width */}
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                        Tải lên bằng cấp / chứng chỉ <span style={{ color: "var(--destructive)" }}>*</span>
                                    </label>

                                    {!file ? (
                                        <div
                                            className="flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed text-center cursor-pointer transition-colors hover:opacity-80"
                                            style={{
                                                borderColor: "var(--border)",
                                                backgroundColor: "var(--background)",
                                            }}
                                        >
                                            <UploadCloud size={32} style={{ color: "var(--primary)" }} />
                                            <p className="text-sm" style={{ color: "var(--foreground)" }}>
                                                Kéo thả file vào đây hoặc
                                                <span
                                                    className="font-medium"
                                                    style={{ color: "var(--primary)" }}
                                                >
                                                    {" "}
                                                    chọn file từ máy tính
                                                </span>
                                            </p>
                                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                                Hỗ trợ định dạng JPG, PNG, PDF (Tối đa 5MB)
                                            </p>
                                        </div>
                                    ) : (
                                        <div
                                            className="flex items-center justify-between p-3.5 rounded-md border"
                                            style={{
                                                borderColor: "var(--border)",
                                                backgroundColor: "var(--card)",
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div style={{ color: "var(--primary)" }}>📄</div>
                                                <div>
                                                    <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                                                        {file}
                                                    </div>
                                                    <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                                        1.2 MB
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFile(null)}
                                                className="border-none bg-transparent cursor-pointer p-1"
                                                style={{ color: "var(--destructive)" }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 rounded-lg border-none font-semibold text-base flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90 mt-8 disabled:opacity-50"
                        style={{
                            backgroundColor: "var(--primary)",
                            color: "var(--primary-foreground)",
                        }}
                    >
                        {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
                        {!loading && <ArrowRight size={20} />}
                    </button>

                    {/* Terms */}
                    <p className="text-sm text-center leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                        Bằng việc đăng ký, bạn xác nhận đã đọc và đồng ý với <br />
                        <Link
                            href="#"
                            className="font-medium no-underline"
                            style={{ color: "var(--foreground)" }}
                        >
                            Điều khoản sử dụng
                        </Link>
                        {" "}và{" "}
                        <Link
                            href="#"
                            className="font-medium no-underline"
                            style={{ color: "var(--foreground)" }}
                        >
                            Chính sách bảo mật
                        </Link>
                        {" "}của chúng tôi.
                    </p>
                </form>
                )}
            </div>
        </main>
    );
}

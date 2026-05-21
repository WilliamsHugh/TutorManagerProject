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
import { useState, useRef, useEffect } from "react";

// Danh sách đầy đủ các môn học
const ALL_SUBJECTS = [
    // Toán & Khoa học
    "Toán", "Toán Cấp 1", "Toán Cấp 2", "Toán Cấp 3", "Luyện thi ĐH Toán",
    "Vật Lý", "Vật Lý 10", "Vật Lý 11", "Vật Lý 12", "Luyện thi ĐH Lý",
    "Hóa Học", "Hóa Học 10", "Hóa Học 11", "Hóa Học 12", "Luyện thi ĐH Hóa",
    "Sinh Học", "Sinh Học 10", "Sinh Học 11", "Sinh Học 12",
    "Tin Học", "Lập Trình", "Python", "JavaScript", "Java",
    // Ngôn ngữ
    "Tiếng Anh", "Tiếng Anh Giao Tiếp", "IELTS", "TOEFL", "TOEIC",
    "Tiếng Việt", "Ngữ Văn", "Ngữ Văn Cấp 2", "Ngữ Văn Cấp 3",
    "Tiếng Trung", "Tiếng Nhật", "Tiếng Hàn", "Tiếng Pháp", "Tiếng Đức",
    // Khoa học xã hội
    "Lịch Sử", "Địa Lý", "Giáo Dục Công Dân",
    // Nghệ thuật & Thể chất
    "Âm Nhạc", "Mỹ Thuật", "Thể Dục",
    // Luyện thi
    "Luyện thi ĐH", "Luyện thi THPT Quốc Gia", "Luyện thi Vào Lớp 10", "Luyện thi Vào Lớp 6",
    // Kỹ năng
    "Kỹ Năng Mềm", "Kỹ Năng Thuyết Trình", "Kỹ Năng Viết",
];

// Gợi ý nhanh hiển thị dưới ô nhập
const QUICK_SUGGEST = [
    "Toán Cấp 3", "Vật Lý 12", "Hóa Học 12", "Tiếng Anh", "IELTS",
    "Ngữ Văn", "Luyện thi ĐH", "Lịch Sử", "Địa Lý", "Tin Học",
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
    const [showDropdown, setShowDropdown] = useState(false);
    const subjectWrapperRef = useRef<HTMLDivElement>(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Lọc danh sách môn học theo từ đang nhập (loại trừ đã chọn)
    const filteredSubjects = ALL_SUBJECTS.filter(
        (s) =>
            s.toLowerCase().includes(subjectInput.toLowerCase()) &&
            !subjects_selected.includes(s)
    );

    // Thêm môn học vào danh sách đã chọn
    const addSubject = (subject: string) => {
        if (!subjects_selected.includes(subject)) {
            setSubjectsSelected([...subjects_selected, subject]);
        }
        setSubjectInput("");
        setShowDropdown(false);
    };

    // Toggle môn gợi ý nhanh
    const toggleQuickSubject = (subject: string) => {
        if (subjects_selected.includes(subject)) {
            setSubjectsSelected(subjects_selected.filter((s) => s !== subject));
        } else {
            setSubjectsSelected([...subjects_selected, subject]);
        }
    };

    const handleSubjectKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const val = subjectInput.trim();
            if (filteredSubjects.length > 0) {
                // Chọn phần tử đầu tiên trong dropdown
                addSubject(filteredSubjects[0]);
            } else if (val && !subjects_selected.includes(val)) {
                // Cho phép nhập tự do nếu không có gợi ý
                addSubject(val);
            }
        } else if (e.key === "Escape") {
            setShowDropdown(false);
        }
    };

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (subjectWrapperRef.current && !subjectWrapperRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                credentials: "include",
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
                                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
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
                            {selectedRole === "student" && (
                                <div
                                    className="absolute top-4 right-4"
                                    style={{ color: "var(--primary)" }}
                                >
                                    <CheckCircle2 size={20} />
                                </div>
                            )}
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
                                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
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
                                    <div ref={subjectWrapperRef}>
                                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                            Các môn có thể dạy <span style={{ color: "var(--destructive)" }}>*</span>
                                        </label>

                                        {/* Combobox wrapper */}
                                        <div className="relative">
                                            <div
                                                className="flex items-center w-full min-h-11 px-3.5 rounded-md border text-sm transition-colors"
                                                style={{
                                                    borderColor: showDropdown ? "var(--primary)" : "var(--border)",
                                                    backgroundColor: "var(--card)",
                                                    boxShadow: showDropdown ? "0 0 0 2px color-mix(in srgb, var(--primary) 25%, transparent)" : "none",
                                                    flexWrap: "wrap",
                                                    gap: "6px",
                                                    paddingTop: "6px",
                                                    paddingBottom: "6px",
                                                }}
                                            >
                                                {/* Selected tags inline trong khung nhập */}
                                                {subjects_selected.map((subject) => (
                                                    <span
                                                        key={subject}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
                                                        style={{
                                                            backgroundColor: "color-mix(in srgb, var(--primary) 15%, transparent)",
                                                            color: "var(--primary)",
                                                            border: "1px solid color-mix(in srgb, var(--primary) 35%, transparent)",
                                                        }}
                                                    >
                                                        {subject}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSubject(subject)}
                                                            className="border-none bg-transparent cursor-pointer p-0 leading-none flex items-center"
                                                            style={{ color: "var(--primary)" }}
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                ))}

                                                {/* Text input */}
                                                <input
                                                    type="text"
                                                    value={subjectInput}
                                                    onChange={(e) => {
                                                        setSubjectInput(e.target.value);
                                                        setShowDropdown(true);
                                                    }}
                                                    onFocus={() => setShowDropdown(true)}
                                                    onKeyDown={handleSubjectKeyDown}
                                                    placeholder={subjects_selected.length === 0 ? "Tìm kiếm hoặc nhập môn học..." : "Thêm môn khác..."}
                                                    className="flex-1 min-w-32 outline-none bg-transparent text-sm"
                                                    style={{ color: "var(--foreground)" }}
                                                />
                                            </div>

                                            {/* Dropdown gợi ý */}
                                            {showDropdown && filteredSubjects.length > 0 && (
                                                <div
                                                    className="absolute z-50 w-full mt-1.5 rounded-lg border overflow-hidden"
                                                    style={{
                                                        borderColor: "var(--border)",
                                                        backgroundColor: "var(--card)",
                                                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                                        maxHeight: "200px",
                                                        overflowY: "auto",
                                                    }}
                                                >
                                                    {filteredSubjects.slice(0, 10).map((subject) => (
                                                        <button
                                                            key={subject}
                                                            type="button"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault(); // giữ focus
                                                                addSubject(subject);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:opacity-80"
                                                            style={{
                                                                color: "var(--foreground)",
                                                                backgroundColor: "transparent",
                                                                borderBottom: "1px solid var(--border)",
                                                            }}
                                                        >
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html: subject.replace(
                                                                        new RegExp(`(${subjectInput})`, "gi"),
                                                                        `<strong style="color:var(--primary)">$1</strong>`
                                                                    ),
                                                                }}
                                                            />
                                                        </button>
                                                    ))}
                                                    {/* Cho phép nhập tùy chỉnh nếu không có kết quả chính xác */}
                                                    {subjectInput.trim() && !ALL_SUBJECTS.some(
                                                        (s) => s.toLowerCase() === subjectInput.trim().toLowerCase()
                                                    ) && (
                                                        <button
                                                            type="button"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                addSubject(subjectInput.trim());
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2"
                                                            style={{ color: "var(--primary)", backgroundColor: "transparent" }}
                                                        >
                                                            <span className="text-base">+</span>
                                                            Thêm &ldquo;{subjectInput.trim()}&rdquo;
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Dropdown khi input rỗng nhưng đang focus */}
                                            {showDropdown && subjectInput === "" && filteredSubjects.length > 0 && (
                                                <div
                                                    className="absolute z-50 w-full mt-1.5 rounded-lg border overflow-hidden"
                                                    style={{
                                                        borderColor: "var(--border)",
                                                        backgroundColor: "var(--card)",
                                                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                                        maxHeight: "200px",
                                                        overflowY: "auto",
                                                    }}
                                                >
                                                    {filteredSubjects.slice(0, 8).map((subject) => (
                                                        <button
                                                            key={subject}
                                                            type="button"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                addSubject(subject);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:opacity-80"
                                                            style={{
                                                                color: "var(--foreground)",
                                                                backgroundColor: "transparent",
                                                                borderBottom: "1px solid var(--border)",
                                                            }}
                                                        >
                                                            {subject}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Gợi ý nhanh */}
                                        <div className="mt-3">
                                            <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>
                                                Gợi ý phổ biến:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {QUICK_SUGGEST.map((subject) => {
                                                    const isSelected = subjects_selected.includes(subject);
                                                    return (
                                                        <button
                                                            key={subject}
                                                            type="button"
                                                            onClick={() => toggleQuickSubject(subject)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
                                                            style={{
                                                                backgroundColor: isSelected
                                                                    ? "color-mix(in srgb, var(--primary) 15%, transparent)"
                                                                    : "var(--muted)",
                                                                color: isSelected ? "var(--primary)" : "var(--muted-foreground)",
                                                                border: isSelected
                                                                    ? "1.5px solid color-mix(in srgb, var(--primary) 40%, transparent)"
                                                                    : "1.5px solid transparent",
                                                                transform: isSelected ? "scale(1.02)" : "scale(1)",
                                                            }}
                                                        >
                                                            {isSelected && <CheckCircle2 size={12} />}
                                                            {subject}
                                                        </button>
                                                    );
                                                })}
                                            </div>
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

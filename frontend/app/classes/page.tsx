"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

import Header from "@/components/Header";
import FilterWidget from "@/components/FilterWidget";
import Sidebar from "@/components/Sidebar";
import Pagination from "@/components/Pagination";
import ClassCard from "@/components/ClassCard";
import Footer from "@/components/Footer";
import { ClassListing } from "@/types/class";

// ─── Types ───────────────────────────────────────────────────────────────────
interface FilterSection {
  id: string;
  label: string;
  options: { label: string; count?: number }[];
}

// ─── Data ────────────────────────────────────────────────────────────────────
const CLASSES: ClassListing[] = [
  {
    id: 1,
    code: "#LH1023",
    title: "Tìm gia sư Tiếng Anh giao tiếp",
    mode: "Online",
    levelTag: "Người đi làm",
    salary: "300,000đ - 350,000đ",
    salaryNote: "/ buổi (1.5h)",
    schedule: "2 buổi/tuần (Tối Thứ 3, Thứ 5)",
    requirement: "Sinh viên ngôn ngữ Anh hoặc có kinh nghiệm sư phạm, IELTS 7.0+",
    postedAt: "Đăng 2 giờ trước",
  },
  {
    id: 2,
    code: "#LH1024",
    title: "Toán lớp 12 - Luyện thi Đại học",
    mode: "Offline",
    levelTag: "Lớp 12",
    salary: "250,000đ",
    salaryNote: "/ buổi (2h)",
    location: "Quận Cầu Giấy, Hà Nội",
    schedule: "3 buổi/tuần (Thứ 2, 4, 6)",
    postedAt: "Đăng 5 giờ trước",
  },
  {
    id: 3,
    code: "#LH1025",
    title: "Rèn chữ đẹp cho bé chuẩn bị vào lớp 1",
    mode: "Offline",
    levelTag: "Mầm non",
    salary: "150,000đ",
    salaryNote: "/ buổi (1.5h)",
    location: "Quận Đống Đa, Hà Nội",
    requirement: "Gia sư nữ, nhẹ nhàng, kiên nhẫn với trẻ em.",
    postedAt: "Đăng hôm qua",
  },
  {
    id: 4,
    code: "#LH1026",
    title: "Lập trình C++ Cơ bản",
    mode: "Online",
    levelTag: "Sinh viên",
    salary: "200,000đ",
    salaryNote: "/ buổi (2h)",
    schedule: "2 buổi/tuần (Thời gian linh hoạt)",
    requirement: "Sinh viên CNTT năm 3 hoặc năm 4, nắm vững thuật toán.",
    postedAt: "Đăng hôm qua",
  },
  {
    id: 5,
    code: "#LH1027",
    title: "Hóa Học lớp 9 - Ôn thi vào lớp 10",
    mode: "Offline",
    levelTag: "Lớp 9",
    salary: "250,000đ",
    salaryNote: "/ buổi (2h)",
    location: "Quận 1, TP.HCM",
    schedule: "2 buổi/tuần (Cuối tuần)",
    postedAt: "Đăng 2 ngày trước",
  },
  {
    id: 6,
    code: "#LH1028",
    title: "Tiếng Hàn Giao Tiếp (Sơ cấp)",
    mode: "Online",
    levelTag: "Người đi làm",
    salary: "300,000đ",
    salaryNote: "/ buổi (1.5h)",
    schedule: "3 buổi/tuần (Các buổi tối trong tuần)",
    requirement: "TOPIK 4 trở lên, ưu tiên có kinh nghiệm dạy online.",
    postedAt: "Đăng 2 ngày trước",
  },
];

const FILTERS: FilterSection[] = [
  {
    id: "subject",
    label: "Môn học",
    options: [
      { label: "Toán", count: 142 },
      { label: "Tiếng Anh", count: 115 },
      { label: "Vật Lý", count: 48 },
      { label: "Hóa Học", count: 36 },
      { label: "Ngữ Văn", count: 40 },
    ],
  },
  {
    id: "level",
    label: "Cấp học",
    options: [
      { label: "Cấp 1 (Tiểu học)" },
      { label: "Cấp 2 (THCS)" },
      { label: "Cấp 3 (THPT)" },
      { label: "Luyện thi Đại học" },
      { label: "Chứng chỉ (IELTS, TOEIC)" },
    ],
  },
  {
    id: "mode",
    label: "Hình thức học",
    options: [
      { label: "Học trực tuyến (Online)" },
      { label: "Học trực tiếp (Offline)" },
    ],
  },
];

const SORT_OPTIONS = ["Mới nhất", "Lương cao nhất", "Lương thấp nhất"];

const TOTAL_PAGES = 12;

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ClassesPage() {
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({
    "subject:Toán": true,
    "level:Cấp 2 (THCS)": true,
    "mode:Học trực tiếp (Offline)": true,
  });
  const [sort, setSort] = useState(SORT_OPTIONS[0]);
  const [showSort, setShowSort] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const toggleFilter = (key: string) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const activeFilterCount = Object.values(checked).filter(Boolean).length;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)", fontFamily: "var(--font-family-body)" }}
    >
      {/* ── Header ── */}
      <Header />

      {/* ── Page Hero ── */}
      <section
        className="py-14 text-center text-white relative overflow-hidden"
        style={{ backgroundColor: "var(--primary)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-white" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-10 blur-2xl bg-white" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold mb-3 leading-tight">Danh Sách Lớp Học Mới</h1>
          <p className="text-base opacity-90">
            Cập nhật liên tục các lớp học đang tìm kiếm gia sư. Đăng ký nhận lớp ngay hôm nay để bắt đầu hành trình giảng dạy của bạn.
          </p>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <div className="max-w-7xl mx-auto px-6 py-10 pb-20">

        {/* Mobile filter toggle */}
        <div className="flex md:hidden justify-between items-center mb-5">
          <span className="text-sm font-semibold text-gray-700">342 lớp đang chờ gia sư</span>
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border"
            style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
          >
            <SlidersHorizontal size={14} />
            Bộ lọc{" "}
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile filter drawer */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilter(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-50 p-5 overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <span className="font-bold text-gray-900">Bộ lọc</span>
                <button onClick={() => setShowMobileFilter(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {FILTERS.map((section) => (
                  <FilterWidget key={section.id} section={section} checked={checked} onToggle={toggleFilter} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-8 items-start">
          {/* Sidebar - desktop */}
          <div className="hidden md:block">
            <Sidebar
              filters={FILTERS}
              checked={checked}
              toggle={toggleFilter}
              search={search}
              onSearchChange={setSearch}
            />
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-2xl border border-gray-100 px-5 py-4">
              <span className="font-semibold text-gray-900 text-sm">
                Đang có <span style={{ color: "var(--primary)" }}>342</span> lớp chờ gia sư
              </span>
              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <span className="text-gray-400">Sắp xếp:</span> {sort}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showSort ? "rotate-180" : ""}`}
                  />
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg shadow-gray-200/80 z-20 overflow-hidden">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setSort(opt); setShowSort(false); }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                        style={{
                          color: opt === sort ? "var(--primary)" : "var(--foreground)",
                          fontWeight: opt === sort ? 600 : 400,
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {CLASSES.map((cls) => (
                <ClassCard key={cls.id} cls={cls} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={TOTAL_PAGES}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

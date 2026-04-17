"use client";

import { useState } from "react";
import {
  ChevronDown, SlidersHorizontal, X,
} from "lucide-react";

import Header from "@/components/Header";
import TutorCard from "@/components/TutorCard";
import FilterWidget from "@/components/FilterWidget";
import Sidebar from "@/components/Sidebar";
import Pagination from "@/components/Pagination";
import Footer from "@/components/Footer";
import { Tutor } from "@/types/tutor";

// ─── Types ───────────────────────────────────────────────────────────────────
interface FilterSection {
  id: string;
  label: string;
  options: { label: string; count?: number }[];
}

// ─── Data ────────────────────────────────────────────────────────────────────
const TUTORS: Tutor[] = [
  { id: 1, name: "Nguyễn Trần Bảo Ngọc", title: "Sinh viên Sư Phạm Toán", avatar: "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F18-25%2FSoutheast%20Asian%2F1", rating: 4.9, reviews: 120, location: "Cầu Giấy, Hà Nội", tags: ["Toán Cấp 3", "Luyện thi Đại học"], price: 200000 },
  { id: 2, name: "Lê Hoàng Nam", title: "Cử nhân Ngôn Ngữ Anh", avatar: "https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FSoutheast%20Asian%2F2", rating: 5.0, reviews: 85, location: "Quận 1, TP.HCM", tags: ["Tiếng Anh Giao Tiếp", "IELTS 7.5+"], price: 250000 },
  { id: 3, name: "Trần Thị Mai", title: "Giáo viên Tiểu học", avatar: "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F3", rating: 4.8, reviews: 210, location: "Hải Châu, Đà Nẵng", tags: ["Rèn chữ đẹp", "Toán Tiểu học"], price: 150000 },
  { id: 4, name: "Đặng Khoa", title: "Sinh viên Bách Khoa", avatar: "https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F18-25%2FSoutheast%20Asian%2F4", rating: 4.7, reviews: 54, location: "Thủ Đức, TP.HCM", tags: ["Vật Lý 12", "Lập trình C++"], price: 180000 },
  { id: 5, name: "Phạm Thúy Vân", title: "Thạc sĩ Hóa Học", avatar: "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F5", rating: 5.0, reviews: 132, location: "Đống Đa, Hà Nội", tags: ["Hóa Học", "Sinh Học"], price: 300000 },
  { id: 6, name: "Bùi Văn Tiến", title: "Giáo viên Chuyên Toán", avatar: "https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F35-50%2FSoutheast%20Asian%2F6", rating: 4.9, reviews: 310, location: "Quận 3, TP.HCM", tags: ["Toán Nâng Cao", "Bồi dưỡng HSG"], price: 350000 },
];

const FILTERS: FilterSection[] = [
  {
    id: "subject", label: "Môn học",
    options: [
      { label: "Toán", count: 342 }, { label: "Tiếng Anh", count: 215 },
      { label: "Vật Lý", count: 128 }, { label: "Hóa Học", count: 96 },
      { label: "Ngữ Văn", count: 110 },
    ],
  },
  {
    id: "level", label: "Cấp học",
    options: [
      { label: "Cấp 1 (Tiểu học)" }, { label: "Cấp 2 (THCS)" },
      { label: "Cấp 3 (THPT)" }, { label: "Luyện thi Đại học" },
      { label: "Chứng chỉ (IELTS, TOEIC)" },
    ],
  },
  {
    id: "mode", label: "Hình thức học",
    options: [
      { label: "Học trực tuyến (Online)" },
      { label: "Học trực tiếp (Offline)" },
    ],
  },
];

const SORT_OPTIONS = [
  "Đánh giá cao nhất",
  "Giá thấp nhất",
  "Giá cao nhất",
  "Nhiều đánh giá nhất",
];

const TOTAL_PAGES = 12;

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TutorsPage() {
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({
    "subject:Toán": true,
    "level:Cấp 2 (THCS)": true,
    "level:Cấp 3 (THPT)": true,
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
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", fontFamily: "var(--font-family-body)" }}>

      {/* ── Header ── */}
      <Header />

      {/* ── Page Hero ── */}
      <section className="py-14 text-center text-white relative overflow-hidden" style={{ backgroundColor: "var(--primary)" }}>
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-white" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-10 blur-2xl bg-white" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold mb-3 leading-tight">Tìm Gia Sư Phù Hợp</h1>
          <p className="text-base opacity-90">
            Hàng ngàn gia sư chất lượng cao đang sẵn sàng đồng hành cùng bạn trên con đường chinh phục tri thức.
          </p>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <div className="max-w-7xl mx-auto px-6 py-10 pb-20">

        {/* Mobile filter toggle */}
        <div className="flex md:hidden justify-between items-center mb-5">
          <span className="text-sm font-semibold text-gray-700">342 gia sư phù hợp</span>
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border"
            style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
          >
            <SlidersHorizontal size={14} />
            Bộ lọc {activeFilterCount > 0 && <span className="bg-blue-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">{activeFilterCount}</span>}
          </button>
        </div>

        {/* Mobile filter drawer */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilter(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-50 p-5 overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <span className="font-bold text-gray-900">Bộ lọc</span>
                <button onClick={() => setShowMobileFilter(false)}><X size={20} /></button>
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
                Tìm thấy <span style={{ color: "var(--primary)" }}>342</span> gia sư phù hợp
              </span>
              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <span className="text-gray-400">Sắp xếp:</span> {sort}
                  <ChevronDown size={14} className={`transition-transform ${showSort ? "rotate-180" : ""}`} />
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-lg shadow-gray-200/80 z-20 overflow-hidden">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setSort(opt); setShowSort(false); }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: opt === sort ? "var(--primary)" : "var(--foreground)", fontWeight: opt === sort ? 600 : 400 }}
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
              {TUTORS.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} />
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
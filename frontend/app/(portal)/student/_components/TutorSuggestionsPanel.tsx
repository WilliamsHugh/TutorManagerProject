"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import type { TutorSuggestion } from "../types";
import { TutorDetailModal } from "./TutorDetailModal";
import { TutorSuggestionCard } from "./TutorSuggestionCard";
import { CustomSelect } from "./CustomSelect";
import { TutorListSkeleton } from "./StudentSkeletons";

type TutorSuggestionsPanelProps = {
  search: string;
  selectedTags: string[];
  tutors: TutorSuggestion[];
  onSearchChange: (value: string) => void;
  loading?: boolean;
  onRecommendTutor?: (tutor: TutorSuggestion) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  subjectsList?: { id: string; name: string }[];
  provincesList?: any[];
  recommendedTutorIds?: string[];
};

export function TutorSuggestionsPanel({
  search,
  selectedTags,
  tutors,
  onSearchChange,
  loading = false,
  onRecommendTutor,
  currentPage,
  totalPages,
  onPageChange,
  subjectsList = [],
  provincesList = [],
  recommendedTutorIds = [],
}: TutorSuggestionsPanelProps) {
  const [selectedTutor, setSelectedTutor] = useState<TutorSuggestion | null>(
    null
  );

  const [showFilters, setShowFilters] = useState(false);
  const [teachingMode, setTeachingMode] = useState<string>("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [filterProvince, setFilterProvince] = useState<string>("");

  // Filter tutors array locally based on user selections
  const filteredTutors = tutors.filter((tutor) => {
    // 1. Filter by teachingMode
    if (teachingMode !== "all") {
      const modeStr = (tutor.teachingMode || "").toLowerCase();
      if (teachingMode === "online" && !modeStr.includes("online")) return false;
      if (teachingMode === "offline" && modeStr.includes("online")) return false;
    }
    // 2. Filter by minRating
    const ratingNum = typeof tutor.rating === "number" ? tutor.rating : parseFloat(tutor.rating) || 0;
    if (ratingNum < minRating) return false;

    // 3. Filter by Subject
    if (filterSubject) {
      if (!tutor.tags.some(tag => tag.toLowerCase() === filterSubject.toLowerCase())) {
        return false;
      }
    }

    // 4. Filter by Province
    if (filterProvince) {
      const locStr = (tutor.location || "").toLowerCase();
      // Remove prefixes like "Thành phố ", "Tỉnh " to ensure fuzzy matching
      const cleanProvince = filterProvince.replace(/^(Thành phố|Tỉnh)\s+/i, "").toLowerCase();
      if (!locStr.includes(cleanProvince)) return false;
    }

    return true;
  });

  return (
    <section className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6 xl:col-span-7">
      <div className="mb-6 flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
            size={16}
          />
          <input
            className="h-10 w-full rounded-md border border-[#e2e8f0] bg-white pl-9 pr-3 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#0b5fff]"
            placeholder="Tìm kiếm tên gia sư hoặc kỹ năng..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <button
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition-all ${
            showFilters
              ? "bg-[#0b5fff] border-[#0b5fff] text-white shadow-sm"
              : "border-[#e2e8f0] bg-transparent text-[#0f172a] hover:bg-[#f8fafc]"
          }`}
          type="button"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={16} />
          Bộ lọc nâng cao
        </button>
      </div>

      {/* Collapsible Advanced Filters panel */}
      {showFilters && (
        <div className="mb-6 rounded-md border border-[#e2e8f0] bg-[#f8fafc] p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#475569]">Hình thức dạy</label>
            <div className="flex gap-2">
              {["all", "online", "offline"].map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setTeachingMode(mode)}
                  className={`h-9 px-3 rounded-md text-xs font-semibold border transition-all ${
                    teachingMode === mode
                      ? "bg-[#0b5fff] border-[#0b5fff] text-white shadow-sm"
                      : "bg-white border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9]"
                  }`}
                >
                  {mode === "all" ? "Tất cả" : mode === "online" ? "Online" : "Offline"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#475569]">Đánh giá tối thiểu</label>
            <CustomSelect
              value={String(minRating)}
              onChange={(val) => setMinRating(Number(val))}
              options={[
                { value: "0", label: "Tất cả sao" },
                { value: "3", label: "Từ 3 ★ trở lên" },
                { value: "4", label: "Từ 4 ★ trở lên" },
                { value: "5", label: "Chỉ 5 ★" },
              ]}
              placeholder="Chọn số sao"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#475569]">Môn học</label>
            <CustomSelect
              value={filterSubject}
              onChange={setFilterSubject}
              options={subjectsList.map((sub) => ({ value: sub.name, label: sub.name }))}
              placeholder="Tất cả môn học"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#475569]">Khu vực / Tỉnh thành</label>
            <CustomSelect
              value={filterProvince}
              onChange={setFilterProvince}
              options={provincesList.map((p) => ({ value: p.name, label: p.name }))}
              placeholder="Tất cả tỉnh thành"
            />
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-[#0f172a]">
          Gia sư gợi ý theo yêu cầu
        </h2>
        {!loading && (
          <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-medium text-[#64748b]">
            Trang {currentPage} / {totalPages}
          </span>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-[#f1f5f9] px-3 py-1.5 text-xs font-medium text-[#64748b]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <TutorListSkeleton count={3} />
        ) : (
          filteredTutors.map((tutor) => (
            <TutorSuggestionCard
              key={tutor.id}
              tutor={tutor}
              onViewDetails={setSelectedTutor}
              onRecommend={onRecommendTutor}
              isRecommended={recommendedTutorIds.includes(String(tutor.id))}
            />
          ))
        )}

        {!loading && filteredTutors.length === 0 && (
          <div className="rounded-lg border border-dashed border-[#e2e8f0] p-8 text-center text-sm text-[#64748b]">
            Chưa tìm thấy gia sư phù hợp với các bộ lọc này.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-[#e2e8f0] pt-4">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="inline-flex h-8 items-center justify-center rounded-md border border-[#e2e8f0] bg-white px-3 text-xs font-semibold text-[#334155] transition-colors hover:bg-[#f8fafc] disabled:opacity-50 disabled:pointer-events-none"
          >
            Trang trước
          </button>
          
          <span className="text-xs font-medium text-[#64748b]">
            Trang {currentPage} / {totalPages}
          </span>
          
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="inline-flex h-8 items-center justify-center rounded-md border border-[#e2e8f0] bg-white px-3 text-xs font-semibold text-[#334155] transition-colors hover:bg-[#f8fafc] disabled:opacity-50 disabled:pointer-events-none"
          >
            Trang sau
          </button>
        </div>
      )}

      <TutorDetailModal
        tutor={selectedTutor}
        onClose={() => setSelectedTutor(null)}
        onRecommend={onRecommendTutor}
        isRecommended={selectedTutor ? recommendedTutorIds.includes(String(selectedTutor.id)) : false}
      />
    </section>
  );
}

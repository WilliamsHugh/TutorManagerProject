"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import type { TutorSuggestion } from "../types";
import { TutorDetailModal } from "./TutorDetailModal";
import { TutorSuggestionCard } from "./TutorSuggestionCard";

type TutorSuggestionsPanelProps = {
  search: string;
  selectedTags: string[];
  tutors: TutorSuggestion[];
  onSearchChange: (value: string) => void;
};

export function TutorSuggestionsPanel({
  search,
  selectedTags,
  tutors,
  onSearchChange,
}: TutorSuggestionsPanelProps) {
  const [selectedTutor, setSelectedTutor] = useState<TutorSuggestion | null>(
    null
  );

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
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#e2e8f0] bg-transparent px-4 text-sm font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc]"
          type="button"
        >
          <SlidersHorizontal size={16} />
          Bộ lọc nâng cao
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-[#0f172a]">
          Gia sư gợi ý theo yêu cầu
        </h2>
        <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-medium text-[#64748b]">
          {tutors.length} kết quả phù hợp
        </span>
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
        {tutors.map((tutor) => (
          <TutorSuggestionCard
            key={tutor.id}
            tutor={tutor}
            onViewDetails={setSelectedTutor}
          />
        ))}

        {tutors.length === 0 && (
          <div className="rounded-lg border border-dashed border-[#e2e8f0] p-8 text-center text-sm text-[#64748b]">
            Chưa tìm thấy gia sư phù hợp với từ khóa này.
          </div>
        )}
      </div>

      <TutorDetailModal
        tutor={selectedTutor}
        onClose={() => setSelectedTutor(null)}
      />
    </section>
  );
}

import Image from "next/image";

import type { TutorSuggestion } from "../types";

type TutorSuggestionCardProps = {
  tutor: TutorSuggestion;
  onViewDetails: (tutor: TutorSuggestion) => void;
};

export function TutorSuggestionCard({
  tutor,
  onViewDetails,
}: TutorSuggestionCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-[#e2e8f0] bg-white p-4 sm:flex-row sm:items-start">
      <Image
        src={tutor.avatar}
        className="h-14 w-14 rounded-full object-cover"
        alt={`Ảnh đại diện ${tutor.name}`}
        width={56}
        height={56}
      />

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold text-[#0f172a]">
            {tutor.name}
          </h3>
          <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-xs font-semibold text-[#166534]">
            {tutor.match}% match
          </span>
        </div>
        <p className="truncate text-[13px] text-[#64748b]">
          {tutor.experience} · {tutor.education}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tutor.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-[#e2e8f0] bg-[#f8fafc] px-2 py-1 text-xs text-[#64748b]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:w-[140px] sm:grid-cols-1">
        <button
          className="h-9 rounded-md border border-[#e2e8f0] bg-transparent px-3 text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc]"
          onClick={() => onViewDetails(tutor)}
          type="button"
        >
          Xem chi tiết
        </button>
        <button
          className="h-9 rounded-md bg-[#0b5fff] px-3 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          type="button"
        >
          Đề xuất gia sư
        </button>
      </div>
    </article>
  );
}

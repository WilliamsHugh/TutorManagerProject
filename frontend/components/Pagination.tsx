"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Build pages array, avoiding duplicates when totalPages is small
  const pages: (number | null)[] = [];
  const fixed = [1, 2, 3];
  fixed.forEach((p) => { if (p <= totalPages) pages.push(p); });
  if (totalPages > 4) pages.push(null); // ellipsis
  if (totalPages > 3) pages.push(totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:text-blue-600 transition-all"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, i) =>
        page === null ? (
          <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">···</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border text-sm font-semibold transition-all"
            style={
              currentPage === page
                ? { backgroundColor: "var(--primary)", color: "white", borderColor: "var(--primary)" }
                : { backgroundColor: "white", color: "var(--foreground)", borderColor: "#e5e7eb" }
            }
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:text-blue-600 transition-all"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
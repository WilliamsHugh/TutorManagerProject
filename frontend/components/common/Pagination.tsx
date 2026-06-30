"use client";

import React from "react";
import { Icon } from "@iconify/react";

interface PaginationProps {
  currentPage: number;
  totalItems?: number;
  itemsPerPage?: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  totalPages: propTotalPages,
  onPageChange,
  label = "phần tử",
}: PaginationProps) {
  // Tính toán số trang linh hoạt dựa trên cả 2 cách truyền tham số
  const resolvedTotalPages = propTotalPages !== undefined 
    ? propTotalPages 
    : (totalItems !== undefined && itemsPerPage !== undefined) 
      ? Math.ceil(totalItems / itemsPerPage) 
      : 1;

  if (resolvedTotalPages <= 1) return null;

  // Nếu có truyền totalItems và itemsPerPage thì hiển thị text mô tả chi tiết, ngược lại chỉ hiển thị nút bấm
  const hasDetails = totalItems !== undefined && itemsPerPage !== undefined;
  const startItem = hasDetails ? Math.min((currentPage - 1) * itemsPerPage! + 1, totalItems!) : 0;
  const endItem = hasDetails ? Math.min(currentPage * itemsPerPage!, totalItems!) : 0;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm mt-4">
      {/* Mobile view */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Trước
        </button>
        <button
          disabled={currentPage === resolvedTotalPages}
          onClick={() => onPageChange(Math.min(currentPage + 1, resolvedTotalPages))}
          className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Sau
        </button>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          {hasDetails && (
            <p className="text-sm text-slate-500 font-medium">
              Hiển thị <span className="font-bold text-slate-800">{startItem}</span> đến{" "}
              <span className="font-bold text-slate-800">{endItem}</span> trong tổng số{" "}
              <span className="font-bold text-slate-800">{totalItems}</span> {label}
            </p>
          )}
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm border border-slate-200 bg-white overflow-hidden" aria-label="Pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              className="relative inline-flex items-center px-3 py-2 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white border-r border-slate-200"
            >
              <Icon icon="lucide:chevron-left" className="h-5 w-5" />
            </button>
            {Array.from({ length: resolvedTotalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border-r border-slate-250 last:border-r-0 transition-colors ${
                    currentPage === pageNum
                      ? "z-10 bg-blue-600 text-white"
                      : "text-slate-900 bg-white hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={currentPage === resolvedTotalPages}
              onClick={() => onPageChange(Math.min(currentPage + 1, resolvedTotalPages))}
              className="relative inline-flex items-center px-3 py-2 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              <Icon icon="lucide:chevron-right" className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import FilterWidget from "@/components/FilterWidget";
import Pagination from "@/components/Pagination";

interface FilterSection {
  id: string;
  label: string;
  options: { label: string; count?: number }[];
}

interface ListingLayoutProps<T> {
  // Hero Section
  heroTitle: string;
  heroDescription: string;
  
  // Data State
  items: T[];
  isLoading: boolean;
  error?: string | null;
  totalItems: number;
  totalPages: number;
  entityName: string;

  // Filter Configuration
  filtersConfig: FilterSection[];
  
  // Sorting Configuration
  sortOptions: string[];
  sort: string;
  setSort: (val: string) => void;

  // Pagination State
  currentPage: number;
  setCurrentPage: (page: number) => void;

  // Filtering State
  search: string;
  setSearch: (val: string) => void;
  checked: Record<string, boolean>;
  toggleFilter: (key: string) => void;

  // Rendering
  renderItem: (item: T) => React.ReactNode;
}

export default function ListingLayout<T>({
  heroTitle,
  heroDescription,
  items,
  isLoading,
  error,
  totalItems,
  totalPages,
  entityName,
  filtersConfig,
  sortOptions,
  sort,
  setSort,
  currentPage,
  setCurrentPage,
  search,
  setSearch,
  checked,
  toggleFilter,
  renderItem,
}: ListingLayoutProps<T>) {
  const [showSort, setShowSort] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const activeFilterCount = Object.values(checked).filter(Boolean).length;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)", fontFamily: "var(--font-family-body)" }}
    >
      <Header />

      {/* ── Page Hero ── */}
      <section
        className="py-14 text-center text-white relative overflow-hidden"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-white" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-10 blur-2xl bg-white" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold mb-3 leading-tight">{heroTitle}</h1>
          <p className="text-base opacity-90">{heroDescription}</p>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <div className="max-w-7xl mx-auto px-6 py-10 pb-20">
        {/* Mobile filter toggle */}
        <div className="flex md:hidden justify-between items-center mb-5">
          <span className="text-sm font-semibold text-gray-700">
            {totalItems} {entityName}
          </span>
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
                {filtersConfig.map((section) => (
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
              filters={filtersConfig}
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
                Tìm thấy <span style={{ color: "var(--primary)" }}>{totalItems}</span> {entityName}
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
                    {sortOptions.map((opt) => (
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

            {/* Error State */}
            {error && (
              <div className="w-full p-6 text-center text-red-600 bg-red-50 rounded-2xl border border-red-100 mb-6">
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Loading State & Data Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 p-6 h-48 shadow-sm" style={{ borderColor: "var(--border)" }}>
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between">
                      <div className="h-8 bg-gray-200 rounded-lg w-1/4" />
                      <div className="h-8 bg-gray-200 rounded-lg w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {items.map(renderItem)}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <p>Không tìm thấy kết quả phù hợp với bộ lọc hiện tại.</p>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

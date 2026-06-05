"use client";
import { Search, X, SendHorizonal } from "lucide-react";
import Link from "next/link";
import FilterWidget from "../common/FilterWidget";

interface FilterOption {
  label: string;
  count?: number;
}

interface FilterSection {
  id: string;
  label: string;
  options: FilterOption[];
}

interface SidebarProps {
  filters: FilterSection[];
  checked: Record<string, boolean>;
  toggle: (key: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export default function Sidebar({ filters, checked, toggle, search, onSearchChange }: SidebarProps) {
  return (
    <aside className="w-72 flex-shrink-0 flex flex-col gap-4">
      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm tên gia sư..."
          className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
        />
        {search && (
          <button onClick={() => onSearchChange("")}>
            <X size={14} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Filter widgets */}
      {filters.map((section) => (
        <FilterWidget key={section.id} section={section} checked={checked} onToggle={toggle} />
      ))}

      {/* Divider */}
      <div className="border-t border-gray-100 my-2" />

      {/* Send request button */}
      <Link
        href="/student"
        className="flex items-center justify-center gap-2.5 w-full h-12 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-lg no-underline"
        style={{
          backgroundColor: "var(--primary)",
          boxShadow: "0 4px 14px rgba(11, 99, 214, 0.25)",
        }}
      >
        <SendHorizonal size={18} />
        Gửi yêu cầu
      </Link>
    </aside>
  );
}
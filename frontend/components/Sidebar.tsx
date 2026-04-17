"use client";
import { Search, X } from "lucide-react";
import FilterWidget from "./FilterWidget";

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
    </aside>
  );
}
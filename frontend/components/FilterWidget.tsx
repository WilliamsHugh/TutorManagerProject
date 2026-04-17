"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FilterOption {
  label: string;
  count?: number;
}

interface FilterSection {
  id: string;
  label: string;
  options: FilterOption[];
}

export default function FilterWidget({
  section,
  checked,
  onToggle,
}: {
  section: FilterSection;
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-4"
      >
        <span className="font-bold text-gray-900 text-sm">{section.label}</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && (
        <div className="flex flex-col gap-3">
          {section.options.map((opt) => {
            const key = `${section.id}:${opt.label}`;
            const isChecked = checked[key] ?? false;
            return (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => onToggle(key)}
                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150"
                  style={{
                    backgroundColor: isChecked ? "var(--primary)" : "white",
                    borderColor: isChecked ? "var(--primary)" : "#e5e7eb",
                  }}
                >
                  {isChecked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700 flex-1">
                  {opt.label}
                  {opt.count && (
                    <span className="text-gray-400 ml-1">({opt.count})</span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
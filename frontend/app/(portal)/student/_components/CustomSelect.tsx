"use client";

import { useState, useEffect, useRef } from "react";

type Option = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
  error?: boolean;
};

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  error = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find currently selected option object
  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 w-full rounded-md border bg-white px-2.5 text-xs text-left flex items-center justify-between transition-all outline-none ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-[#f8fafc]"
            : "hover:border-[#cbd5e1] focus:border-[#0b5fff] focus:ring-1 focus:ring-[#0b5fff]"
        } ${error ? "border-[#ef4444]" : "border-[#e2e8f0]"}`}
      >
        <span className={value ? "text-[#0f172a]" : "text-[#64748b] truncate"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`h-3.5 w-3.5 text-[#64748b] shrink-0 transition-transform duration-200 ml-1.5 ${
            isOpen ? "rotate-180 text-[#0b5fff]" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Floating Option List */}
      {isOpen && !disabled && (
        <ul className="absolute left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-md border border-[#e2e8f0] bg-white py-1 shadow-lg text-xs outline-none animate-in fade-in slide-in-from-top-1 duration-100">
          <li
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className="cursor-pointer px-2.5 py-2 text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
          >
            {placeholder}
          </li>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`cursor-pointer px-2.5 py-2 transition-colors flex items-center justify-between select-none ${
                  isSelected
                    ? "bg-[#f0f7ff] text-[#0b5fff] font-bold"
                    : "text-[#334155] hover:bg-[#f1f5f9]"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <svg
                    className="h-3.5 w-3.5 text-[#0b5fff]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client"

import { ChevronDown, Search, RotateCw } from "lucide-react"
import { useState, useRef, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type RequestToolbarProps = {
  search: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onRefresh?: () => void
}

export function RequestToolbar({
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onRefresh,
}: RequestToolbarProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const statusOptions: { value: string; label: string }[] = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "proposed", label: "Đã đề xuất" },
    { value: "negotiating", label: "Đang thương lượng" },
    { value: "processing", label: "Đang xử lý" },
    { value: "matched", label: "Đã ghép" },
    { value: "cancelled", label: "Đã hủy" },
    { value: "declined", label: "Đã từ chối" },
  ]

  const currentLabel = statusOptions.find(o => o.value === statusFilter)?.label || "Tất cả trạng thái"

  return (
    <div className="flex max-w-[620px] gap-2">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={14}
        />
        <Input
          className="h-8 rounded pl-9 text-xs"
          placeholder="Tìm theo mã YC, SĐT phụ huynh hoặc học viên..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="relative" ref={dropdownRef}>
        <Button
          className="h-8 rounded text-xs gap-1.5"
          variant="outline"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {currentLabel}
          <ChevronDown size={12} />
        </Button>
        {showDropdown && (
          <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-md border border-border bg-white p-1 shadow-md text-xs flex flex-col">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                className={`w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded transition-colors ${
                  statusFilter === option.value ? "font-bold text-primary" : "text-slate-900"
                }`}
                onClick={() => {
                  onStatusFilterChange(option.value)
                  setShowDropdown(false)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className="h-8 px-2.5 flex items-center justify-center rounded border border-border bg-white hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
          title="Làm mới"
        >
          <RotateCw size={14} />
        </button>
      )}
    </div>
  )
}

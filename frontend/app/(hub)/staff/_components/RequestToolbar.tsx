import { ChevronDown, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type RequestToolbarProps = {
  search: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
}

export function RequestToolbar({
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: RequestToolbarProps) {
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
      <div className="relative">
        <select
          className="h-8 appearance-none rounded border border-border bg-white pl-3 pr-8 text-xs font-semibold outline-none transition-colors hover:bg-muted focus:border-ring focus:ring-2"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="matched">Đã ghép</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={12}
        />
      </div>
    </div>
  )
}

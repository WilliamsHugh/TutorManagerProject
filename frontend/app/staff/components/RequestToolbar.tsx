import { ChevronDown, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type RequestToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
}

export function RequestToolbar({
  search,
  onSearchChange,
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
      <Button className="h-8 rounded text-xs" variant="outline">
        Tất cả trạng thái
        <ChevronDown size={13} />
      </Button>
    </div>
  )
}

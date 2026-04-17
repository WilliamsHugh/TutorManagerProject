import { Button } from "@/components/ui/button"

type RequestPaginationProps = {
  totalCount: number
  visibleCount: number
}

export function RequestPagination({
  totalCount,
  visibleCount,
}: RequestPaginationProps) {
  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>
        Hiển thị 1-{visibleCount} trong {totalCount} yêu cầu
      </span>
      <div className="flex gap-2">
        <Button className="h-7 rounded text-xs" variant="outline">
          Trước
        </Button>
        <Button className="h-7 rounded px-3 text-xs">1</Button>
        <Button className="h-7 rounded px-3 text-xs" variant="outline">
          2
        </Button>
        <Button className="h-7 rounded text-xs" variant="outline">
          Sau
        </Button>
      </div>
    </div>
  )
}

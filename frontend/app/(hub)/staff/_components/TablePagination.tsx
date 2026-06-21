import { Button } from "@/components/ui/button"

type TablePaginationProps = {
  currentPage: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  itemName?: string
}

export function TablePagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  itemName = "bản ghi",
}: TablePaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize)
  if (totalPages <= 1) return null

  const startIdx = (currentPage - 1) * pageSize + 1
  const endIdx = Math.min(currentPage * pageSize, totalItems)

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-3 border-t border-slate-100 bg-white">
      <span>
        Hiển thị {startIdx}-{endIdx} trong số {totalItems} {itemName}
      </span>
      <div className="flex gap-1.5 items-center">
        <Button
          className="h-7 rounded text-[11px] px-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Trước
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            className={`h-7 w-7 rounded text-[11px] p-0 font-medium ${
              currentPage === p
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-transparent text-muted-foreground hover:bg-slate-100 border border-slate-200"
            }`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
        <Button
          className="h-7 rounded text-[11px] px-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Sau
        </Button>
      </div>
    </div>
  )
}

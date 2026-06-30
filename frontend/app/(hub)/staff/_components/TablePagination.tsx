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

  const getVisiblePages = () => {
    const delta = 1
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []
    let l: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i)
      }
    }

    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l > 2) {
          rangeWithDots.push("...")
        }
      }
      rangeWithDots.push(i)
      l = i
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  const baseButtonClass =
    "h-8 px-3 rounded text-[11px] font-semibold transition-all duration-200 flex items-center justify-center border select-none shrink-0"

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mt-4 pt-3 border-t border-slate-200/20 dark:border-white/5 w-full">
      <span className="text-slate-500 font-semibold shrink-0 text-center sm:text-left">
        Hiển thị {startIdx}-{endIdx} trong số {totalItems} {itemName}
      </span>
      <div className="flex gap-1.5 items-center flex-wrap justify-center max-w-full">
        {/* Nút Trước */}
        <button
          className={baseButtonClass}
          style={{
            color: currentPage === 1 ? "#94a3b8" : "#334155",
            borderColor: currentPage === 1 ? "#e2e8f0" : "#cbd5e1",
            backgroundColor: "transparent",
            opacity: currentPage === 1 ? 0.5 : 1,
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
          }}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Trước
        </button>

        {visiblePages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`dots-${idx}`}
                className="px-2 font-bold select-none"
                style={{ color: "#94a3b8" }}
              >
                ...
              </span>
            )
          }
          const pageNum = p as number
          const isActive = currentPage === pageNum

          return (
            <button
              key={pageNum}
              className={`${baseButtonClass} w-8 p-0`}
              style={
                isActive
                  ? {
                      color: "#0f172a",
                      backgroundColor: "#f59e0b",
                      borderColor: "#f59e0b",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }
                  : {
                      color: "#334155",
                      backgroundColor: "transparent",
                      borderColor: "#e2e8f0",
                      cursor: "pointer",
                    }
              }
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          )
        })}

        {/* Nút Sau */}
        <button
          className={baseButtonClass}
          style={{
            color: currentPage === totalPages ? "#94a3b8" : "#334155",
            borderColor: currentPage === totalPages ? "#e2e8f0" : "#cbd5e1",
            backgroundColor: "transparent",
            opacity: currentPage === totalPages ? 0.5 : 1,
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          }}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  )
}

"use client"

import { StaffHeader } from "./StaffHeader"
import { StaffSidebar } from "./StaffSidebar"

type StaffShellProps = {
  children: React.ReactNode
  current?: string
  parent?: string
}

export function StaffShell({ children, current, parent }: StaffShellProps) {
  return (
    <div className="h-screen overflow-hidden bg-[#f4f7fb] text-foreground flex">
      {/* Sidebar cố định bên trái */}
      <StaffSidebar />
      
      {/* Container bên phải chiếm toàn bộ chiều cao còn lại và không cuộn */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header ngang cố định phía trên */}
        <StaffHeader current={current} parent={parent} />
        
        {/* Phần nội dung có thể cuộn dọc */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  )
}

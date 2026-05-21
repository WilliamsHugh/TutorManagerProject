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
    <div className="min-h-screen bg-[#f4f7fb] text-foreground">
      <div className="flex min-h-screen">
        <StaffSidebar />
        <div className="min-w-0 flex-1">
          <StaffHeader current={current} parent={parent} />
          <main className="p-5">{children}</main>
        </div>
      </div>
    </div>
  )
}

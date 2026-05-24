"use client"

import { StaffSidebar } from "./StaffSidebar"

type StaffShellProps = {
  children: React.ReactNode
  current?: string
  parent?: string
}

export function StaffShell({ children, current, parent }: StaffShellProps) {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#f4f7fb] text-foreground">
      <div className="flex min-h-[calc(100vh-4.5rem)]">
        <StaffSidebar />
        <div className="min-w-0 flex-1">
          <main className="p-5">{children}</main>
        </div>
      </div>
    </div>
  )
}

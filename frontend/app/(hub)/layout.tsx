import AdminGuard from "@/components/auth/AdminGuard"
import { StaffShell } from "@/app/(hub)/staff/_components/StaffShell"

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <StaffShell>{children}</StaffShell>
    </AdminGuard>
  )
}
import { Suspense } from "react";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <AdminDashboardClient />
    </Suspense>
  );
}

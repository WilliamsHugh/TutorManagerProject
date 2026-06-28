import { Suspense } from "react";
import StaffDashboardClient from "./StaffDashboardClient";

export default async function StaffDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <StaffDashboardClient />
    </Suspense>
  );
}

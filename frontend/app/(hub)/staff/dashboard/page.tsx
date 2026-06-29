import { Suspense } from "react";
import StaffDashboardClient from "./StaffDashboardClient";

import PageLoader from "@/components/common/PageLoader";

export default async function StaffDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <StaffDashboardClient />
    </Suspense>
  );
}

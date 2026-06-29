import { Suspense } from "react";
import StaffClassesClient from "./StaffClassesClient";

import PageLoader from "@/components/common/PageLoader";

export default async function StaffClassesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <StaffClassesClient />
    </Suspense>
  );
}

import { Suspense } from "react";
import StaffStudentsClient from "./StaffStudentsClient";

import PageLoader from "@/components/common/PageLoader";

export default async function StaffStudentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <StaffStudentsClient />
    </Suspense>
  );
}

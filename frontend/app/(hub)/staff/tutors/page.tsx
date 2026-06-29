import { Suspense } from "react";
import StaffTutorsClient from "./StaffTutorsClient";

import PageLoader from "@/components/common/PageLoader";

export default async function StaffTutorsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <StaffTutorsClient />
    </Suspense>
  );
}

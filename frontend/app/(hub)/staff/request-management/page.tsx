import { Suspense } from "react";
import RequestManagementClient from "./RequestManagementClient";

import { RequestTableSkeleton } from "./RequestManagementClient";

export default async function RequestManagementPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={<RequestTableSkeleton />}>
      <RequestManagementClient />
    </Suspense>
  );
}

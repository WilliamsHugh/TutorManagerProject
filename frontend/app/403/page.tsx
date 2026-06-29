import { Suspense } from "react";
import ForbiddenClient from "./ForbiddenClient";

import PageLoader from "@/components/common/PageLoader";

export default async function ForbiddenPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <ForbiddenClient />
    </Suspense>
  );
}

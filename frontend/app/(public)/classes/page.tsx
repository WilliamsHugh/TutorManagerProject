import { Suspense } from "react";
import PublicClassesClient from "./PublicClassesClient";

import PageLoader from "@/components/common/PageLoader";

export default async function ClassesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <PublicClassesClient />
    </Suspense>
  );
}

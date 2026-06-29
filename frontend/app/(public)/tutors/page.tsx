import { Suspense } from "react";
import PublicTutorsClient from "./PublicTutorsClient";

import PageLoader from "@/components/common/PageLoader";

export default async function TutorsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <PublicTutorsClient />
    </Suspense>
  );
}

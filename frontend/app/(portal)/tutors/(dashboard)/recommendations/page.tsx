import { Suspense } from "react";
import TutorRecommendationsClient from "./TutorRecommendationsClient";

import PageLoader from "@/components/common/PageLoader";

export default async function TutorRecommendationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <TutorRecommendationsClient />
    </Suspense>
  );
}

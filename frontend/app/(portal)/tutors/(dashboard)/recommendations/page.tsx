import { Suspense } from "react";
import TutorRecommendationsClient from "./TutorRecommendationsClient";

export default async function TutorRecommendationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <TutorRecommendationsClient />
    </Suspense>
  );
}

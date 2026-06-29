import { Suspense } from "react";
import AboutPageClient from "./AboutPageClient";

import PageLoader from "@/components/common/PageLoader";

export default async function AboutPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <AboutPageClient />
    </Suspense>
  );
}

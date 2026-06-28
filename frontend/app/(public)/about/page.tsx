import { Suspense } from "react";
import AboutPageClient from "./AboutPageClient";

export default async function AboutPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <AboutPageClient />
    </Suspense>
  );
}

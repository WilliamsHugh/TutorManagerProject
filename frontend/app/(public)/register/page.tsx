import { Suspense } from "react";
import RegisterPageClient from "./RegisterPageClient";

import PageLoader from "@/components/common/PageLoader";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <RegisterPageClient />
    </Suspense>
  );
}

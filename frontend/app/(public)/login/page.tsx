import { Suspense } from "react";
import LoginPageClient from "./LoginPageClient";

import PageLoader from "@/components/common/PageLoader";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <LoginPageClient />
    </Suspense>
  );
}

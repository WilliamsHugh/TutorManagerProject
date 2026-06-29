import { Suspense } from "react";
import ForgotPasswordClient from "./ForgotPasswordClient";

import PageLoader from "@/components/common/PageLoader";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <ForgotPasswordClient />
    </Suspense>
  );
}

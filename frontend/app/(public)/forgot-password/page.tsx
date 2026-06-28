import { Suspense } from "react";
import ForgotPasswordClient from "./ForgotPasswordClient";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <ForgotPasswordClient />
    </Suspense>
  );
}

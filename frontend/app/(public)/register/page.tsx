import { Suspense } from "react";
import RegisterPageClient from "./RegisterPageClient";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <RegisterPageClient />
    </Suspense>
  );
}

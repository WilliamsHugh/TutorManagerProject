import { Suspense } from "react";
import LoginPageClient from "./LoginPageClient";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <LoginPageClient />
    </Suspense>
  );
}

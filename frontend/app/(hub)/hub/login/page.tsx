import { Suspense } from "react";
import HubLoginClient from "./HubLoginClient";

export default async function HubLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <HubLoginClient />
    </Suspense>
  );
}

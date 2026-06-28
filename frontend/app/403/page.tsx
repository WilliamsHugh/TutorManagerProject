import { Suspense } from "react";
import ForbiddenClient from "./ForbiddenClient";

export default async function ForbiddenPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <ForbiddenClient />
    </Suspense>
  );
}

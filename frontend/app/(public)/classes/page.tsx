import { Suspense } from "react";
import PublicClassesClient from "./PublicClassesClient";

export default async function ClassesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <PublicClassesClient />
    </Suspense>
  );
}

import { Suspense } from "react";
import StaffClassesClient from "./StaffClassesClient";

export default async function StaffClassesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <StaffClassesClient />
    </Suspense>
  );
}

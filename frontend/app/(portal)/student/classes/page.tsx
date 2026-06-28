import { Suspense } from "react";
import StudentClassesClient from "./StudentClassesClient";

export default async function StudentClassesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <StudentClassesClient />
    </Suspense>
  );
}

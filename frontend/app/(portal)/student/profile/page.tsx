import { Suspense } from "react";
import StudentProfileClient from "./StudentProfileClient";

export default async function StudentProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <StudentProfileClient />
    </Suspense>
  );
}

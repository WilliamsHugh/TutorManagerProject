import { Suspense } from "react";
import StudentClassesClient from "./StudentClassesClient";

import { ClassListSkeleton } from "../_components/StudentSkeletons";

export default async function StudentClassesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] p-8">
      <Suspense fallback={<ClassListSkeleton />}>
        <StudentClassesClient />
      </Suspense>
    </div>
  );
}

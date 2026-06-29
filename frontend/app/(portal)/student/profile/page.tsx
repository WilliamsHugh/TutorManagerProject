import { Suspense } from "react";
import StudentProfileClient from "./StudentProfileClient";

import { ProfileSkeleton } from "../_components/StudentSkeletons";

export default async function StudentProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <StudentProfileClient />
    </Suspense>
  );
}

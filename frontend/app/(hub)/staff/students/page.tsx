import { Suspense } from "react";
import StaffStudentsClient from "./StaffStudentsClient";

export default async function StaffStudentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <StaffStudentsClient />
    </Suspense>
  );
}

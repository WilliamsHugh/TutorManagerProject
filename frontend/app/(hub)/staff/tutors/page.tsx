import { Suspense } from "react";
import StaffTutorsClient from "./StaffTutorsClient";

export default async function StaffTutorsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <StaffTutorsClient />
    </Suspense>
  );
}

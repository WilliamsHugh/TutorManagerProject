import { Suspense } from "react";
import PublicTutorsClient from "./PublicTutorsClient";

export default async function TutorsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <PublicTutorsClient />
    </Suspense>
  );
}

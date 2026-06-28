import { Suspense } from "react";
import StudentDashboardClient from "./StudentDashboardClient";

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await searchParams on the server to ensure the Promise is consumed
  // before rendering the client component
  if (searchParams) {
    await searchParams;
  }

  return (
    <Suspense fallback={null}>
      <StudentDashboardClient />
    </Suspense>
  );
}

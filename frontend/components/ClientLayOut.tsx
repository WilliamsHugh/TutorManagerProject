"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isHub = pathname.startsWith("/hub") && pathname !== "/hub/login";
  const isStudent = pathname.includes("/student");

  return (
    <>
      {isStudent && <Header />}
      {isHub && <Header customLinks={[]} />}
      {children}
    </>
  );
}
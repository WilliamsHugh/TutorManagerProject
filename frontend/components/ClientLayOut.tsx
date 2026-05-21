"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shouldShowPublicHeader =
    pathname.startsWith("/dashboard/student") ||
    (!pathname.startsWith("/hub") &&
      !pathname.startsWith("/staff") &&
      pathname !== "/login" &&
      pathname !== "/register");

  return (
    <>
      {shouldShowPublicHeader && <Header />}
      {children}
    </>
  );
}

"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // usePathname() trả về đúng pathname cả server lẫn client, nên không cần mounted state
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";

  return (
    <>
      {!isAuthPage && <Header />}
      {children}
      <Footer />
    </>
  );
}

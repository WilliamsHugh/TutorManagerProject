"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ẩn Header trên các trang xác thực (login, register, forgot-password)
  const hideHeader = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";

  return (
    <>
      {!hideHeader && <Header />}
      {children}
      <Footer />
    </>
  );
}

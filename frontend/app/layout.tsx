import type { Metadata } from "next";
import "./globals.css";
import SessionTimeoutHandler from "@/components/auth/SessionTimeoutHandler";

export const metadata: Metadata = {
  title: "TutorEdu – Khám Phá Tiềm Năng Cùng Gia Sư Xuất Sắc",
  description:
    "Hệ thống quản lý và kết nối gia sư uy tín hàng đầu. Trải nghiệm học tập thông minh hơn, đạt điểm cao hơn cùng TutorEdu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased font-sans" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SessionTimeoutHandler />
        {children}
      </body>
    </html>
  );
}

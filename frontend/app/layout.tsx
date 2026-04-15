import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

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
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

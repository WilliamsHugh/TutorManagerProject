import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { navItems } from "./_config/constants";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header customLinks={navItems} />
      {children}
      <Footer />
    </>
  );
}

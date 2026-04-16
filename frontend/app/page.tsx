import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import SubjectsSection from "@/components/SubjectsSection";
import TutorsSection from "@/components/TutorsSection";
import RolesSection from "@/components/RolesSection";
import CTASection from "@/components/CTASection";
<<<<<<< HEAD
import Footer from "@/components/Footer";
=======
>>>>>>> c575020 (Add staff request management)

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <SubjectsSection />
        <TutorsSection />
        <RolesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

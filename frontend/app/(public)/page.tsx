import HeroSection from "@/components/sections/HeroSection";
import StatsSection from "@/components/sections/StatsSection";
import SubjectsSection from "@/components/sections/SubjectsSection";
import TutorsSection from "@/components/sections/TutorsSection";
import RolesSection from "@/components/sections/RolesSection";
import CTASection from "@/components/sections/CTASection";

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <SubjectsSection />
        <TutorsSection />
        <RolesSection />
        <CTASection />
      </main>
    </>
  );
}

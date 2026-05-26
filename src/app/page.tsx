import { Navbar } from "@/components/shared/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Showcase } from "@/components/landing/Showcase";
import { EthnicWearScroll } from "@/components/landing/EthnicWearScroll";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { ScrollProgress } from "@/components/shared/ScrollProgress";

export default function LandingPage() {
  return (
    <div className="dark bg-[#0A0A0A]">
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Showcase />
        <EthnicWearScroll />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

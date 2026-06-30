import Navbar from "../../components/layout/Navbar";
import HeroSection from "../../components/landing/HeroSection";
import ProblemSection from "../../components/landing/ProblemSection";
import HowItWorksSection from "../../components/landing/HowItWorksSection";
import ServicesSection from "../../components/landing/ServicesSection";
import AiSection from "../../components/landing/AiSection";
import CTASection from "../../components/landing/CTASection";
import Footer from "../../components/layout/Footer";

export default function Landing() {
  return (
    <>
      <Navbar />

      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <ServicesSection />
      <AiSection />
      <CTASection />

      <Footer />
    </>
  );
}
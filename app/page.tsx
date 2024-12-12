import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ImageCarousel from "@/components/ImageCarousel";
import MissionVision from "@/components/MissionVision";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <ImageCarousel />
      <MissionVision />
      <Features />
      <Contact />
      <Footer />
    </main>
  );
}

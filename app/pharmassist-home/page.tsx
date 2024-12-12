import Hero from "@/components/pa_hero";
import Features from "@/components/pa_features";
import About from "@/components/about";
import Contact from "@/components/pa_contact";
import Footer from "@/components/pa_footer";
import { TracingBeam } from "@/components/ui/tracing-beam";
import Team from "@/components/team";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={`min-h-screen ${styles.pharmassistHome}`}>
      <TracingBeam>
        <Hero />
        <Features />
        <About />
        <Team />
        <Contact />
      </TracingBeam>
      <Footer />
    </main>
  );
}

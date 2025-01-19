import Hero from "@/components/pa_hero";
import Features from "@/components/pa_features";
import About from "@/components/about";
import Contact from "@/components/pa_contact";
import Footer from "@/components/pa_footer";
import Team from "@/components/team";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={`min-h-screen ${styles.pharmassistHome}`}>
      <Hero />
      <Features />
      <About />
      <Team />
      <Contact />
      <Footer />
    </main>
  );
}

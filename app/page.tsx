import { About } from "@/components/About";
import { Audience } from "@/components/Audience";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Audience />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

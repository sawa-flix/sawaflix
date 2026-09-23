import ReactDOM from "react-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import GenreSection from "@/components/GenreSection";
import MoviesSection from "@/components/MoviesSection";
import TraditionalSection from "@/components/TraditionalSection";
import LivingTraditions from "@/components/LivingTraditions";
import AISection from "@/components/AISection";
import FestivalBanner from "@/components/FestivalBanner";
import Footer from "@/components/Footer";

export default function Home() {
  // Preload critical hero cover image assets before initial paint
  ReactDOM.preload("/SawaFlix_Cameroonian_Entertainment_Cover.webp", {
    as: "image",
    type: "image/webp",
    fetchPriority: "high",
  });

  return (
    <main className="min-h-screen bg-[#0B0E14] text-white overflow-hidden">
      <Navbar />
      <Hero />
      <GenreSection />
      <MoviesSection />
      <TraditionalSection />
      <LivingTraditions />
      <AISection />
      <FestivalBanner />
      <Footer />
    </main>
  );
}

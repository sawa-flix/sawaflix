import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#100d1e] text-white">
      <Navbar />
      <Hero />
    </main>
  );
}

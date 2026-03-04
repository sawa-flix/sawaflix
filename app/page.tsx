"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
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
<<<<<<< HEAD
=======
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/landingPage");
            } else {
                setIsLoading(false);
            }
        }
        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
>>>>>>> 89c67160f2cda8cb7ddb4eab395fe200b75cb759

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

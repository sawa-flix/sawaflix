"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative h-[100dvh] w-full overflow-hidden flex flex-col justify-end md:justify-center items-center bg-[#0B0E14]"
    >
      {/* Background Image with Simple Deep Gradient */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-[center_top] md:bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/Hero-background.jpg')",
          }}
        />
        {/* Simple, heavy gradients for maximum clarity and mobile-app feel */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent hidden md:block" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-16 md:pb-0 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 md:space-y-8"
        >
          {/* Subtitle / Brand Tag */}
          <div className="flex justify-center">
            <span className="text-red-600 font-bold text-[9px] md:text-[11px] tracking-[0.5em] uppercase opacity-90">
              Sawaflix Original
            </span>
          </div>

          {/* Main Headline - Fluid & Elegant Typography */}
          <h1 className="text-[clamp(2.25rem,8vw,4.5rem)] leading-[1.05] md:leading-[1.1] font-black tracking-tighter text-white">
            Unlimited Culture.<br className="hidden md:block" />
            Infinite Stories.
          </h1>

          {/* Description text - Fluid & Readable */}
          <p className="max-w-xl mx-auto text-[clamp(0.95rem,2vw,1.15rem)] text-gray-300 font-medium leading-relaxed px-4 md:px-0 opacity-80">
            Discover the rich heritage of Africa through curated music, cinema, and traditions. 
            A platform dedicated to keeping our stories alive.
          </p>

          {/* Call to Action - Refined & Balanced */}
          <div className="flex flex-col items-center pt-4 md:pt-6">
            <Link
              href="/dashboard"
              className="group flex items-center justify-center gap-2 w-full md:w-auto md:px-12 py-3.5 md:py-4 bg-red-600 text-white rounded-lg font-black text-base md:text-lg transition-all active:scale-[0.97] shadow-xl shadow-red-600/20 hover:bg-red-700"
            >
              Get Started
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <p className="mt-6 text-gray-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">
              Watch anywhere. Cancel anytime.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Subtle Bottom Fade for mobile app look */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0B0E14] to-transparent z-20 pointer-events-none" />
    </section>
  );
}

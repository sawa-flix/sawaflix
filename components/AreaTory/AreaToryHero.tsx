"use client";

import { motion } from "framer-motion";
import { ChevronRight, Calendar, Users, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AreaToryHero() {
  return (
    <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden flex items-center justify-center bg-[#0B0E14]">
      {/* Background with simple deep gradient */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] scale-110"
          style={{
            backgroundImage: "url('/images/Hero-background.jpg')", // Reusing for consistency as requested
            filter: "brightness(0.35) saturate(1.1)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-black/60" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center md:text-left grid md:grid-cols-2 items-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Tag */}
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <span className="w-8 h-[1px] bg-red-600 hidden md:block" />
            <span className="text-red-600 font-bold text-[10px] tracking-[0.3em] uppercase">
              Community & culture
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
            Area <span className="text-red-600">tory.</span>
          </h1>

          <p className="max-w-md text-sm md:text-base text-gray-300 font-medium leading-relaxed opacity-80 mb-6">
            The heart of Sawaflix. Discover exclusive announcements, 
            cultural stories, and our growing community.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-lg font-bold text-xs transition-all active:scale-[0.97] shadow-lg shadow-red-600/20 uppercase tracking-widest">
              Explore stories
            </button>
            <div className="flex items-center gap-6 px-4">
               <div className="flex flex-col items-center md:items-start">
                  <span className="text-white font-bold text-base">12k+</span>
                  <span className="text-gray-500 text-[9px] uppercase tracking-widest font-bold">Followers</span>
               </div>
               <div className="w-[1px] h-6 bg-gray-800" />
               <div className="flex flex-col items-center md:items-start">
                  <span className="text-white font-bold text-base">450+</span>
                  <span className="text-gray-500 text-[9px] uppercase tracking-widest font-bold">Stories</span>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Compact Featured Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hidden md:block relative group"
        >
          <div className="relative aspect-[16/9] w-full max-w-sm ml-auto bg-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?q=80&w=2070&auto=format&fit=crop')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="inline-block px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded-md mb-2 uppercase tracking-widest">
                Latest
              </span>
              <h3 className="text-lg font-bold text-white mb-1 leading-tight">
                Nyem-nyem festival 2024
              </h3>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { ChevronRight, Calendar, Users, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AreaToryHero() {
  return (
    <section className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden flex items-center justify-center bg-[#0B0E14]">
      {/* Background with simple deep gradient */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] scale-110"
          style={{
            backgroundImage: "url('/images/Hero-background.jpg')", // Reusing for consistency as requested
            filter: "brightness(0.4) saturate(1.2)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-black/60" />
        {/* Animated Overlay for "Story" feel */}
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute inset-0 bg-red-600/5 mix-blend-overlay"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center md:text-left grid md:grid-cols-2 items-center gap-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Tag */}
          <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
            <span className="w-12 h-[1px] bg-red-600 hidden md:block" />
            <span className="text-red-600 font-black text-xs tracking-[0.4em] uppercase">
              Community & Culture
            </span>
          </div>

          <h1 className="text-[3rem] leading-[0.9] sm:text-6xl md:text-8xl font-black tracking-tighter text-white mb-6">
            AREA <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
              TORY.
            </span>
          </h1>

          <p className="max-w-xl text-lg md:text-xl text-gray-300 font-medium leading-relaxed opacity-90 mb-8">
            The beating heart of Sawaflix. Discover exclusive announcements, 
            deep cultural stories, and the pulse of our growing community.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-red-600 text-white rounded-lg font-black text-sm transition-all active:scale-[0.97] shadow-xl shadow-red-600/20">
              EXPLORE STORIES
            </button>
            <div className="flex items-center gap-6 px-4">
               <div className="flex flex-col items-center md:items-start">
                  <span className="text-white font-bold text-lg">12K+</span>
                  <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Followers</span>
               </div>
               <div className="w-[1px] h-8 bg-gray-800" />
               <div className="flex flex-col items-center md:items-start">
                  <span className="text-white font-bold text-lg">450+</span>
                  <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Stories</span>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Creative Visual Element - Featured Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="hidden md:block relative group"
        >
          <div className="absolute -inset-4 bg-red-600/20 blur-3xl rounded-full opacity-30 group-hover:opacity-50 transition-opacity" />
          <div className="relative aspect-[4/5] w-full max-w-sm ml-auto bg-gray-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?q=80&w=2070&auto=format&fit=crop')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <span className="inline-block px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-full mb-3 uppercase tracking-widest">
                Latest News
              </span>
              <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                Nyem-Nyem Festival 2024: The Warrior's Legacy
              </h3>
              <p className="text-gray-400 text-sm font-medium line-clamp-2">
                Join us as we explore the historical resistance of the Nyem-Nyem people through war dances and sacred rites.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

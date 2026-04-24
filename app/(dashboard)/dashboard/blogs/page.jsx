"use client";

import AreaToryHero from "@/components/AreaTory/AreaToryHero";
import StoryGrid from "@/components/AreaTory/StoryGrid";
import { motion } from "framer-motion";
import { Bell, MessageSquare, Send, Plus } from "lucide-react";

export default function AreaToryDashboardPage() {
  return (
    <div className="space-y-12 pb-20">
      {/* Integrated Area Tory Hero - Scaled for Dashboard */}
      <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/5">
        <AreaToryHero />
      </div>

      {/* Live Updates Section - Dashboard Themed */}
      <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
             <div className="w-14 h-14 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-600/20">
                <Bell className="w-6 h-6 text-red-600" />
             </div>
             <div>
                <h4 className="text-white font-black text-lg uppercase tracking-tight">Live Updates</h4>
                <p className="text-gray-500 text-sm font-medium">Community announcements and real-time news.</p>
             </div>
          </div>

          <div className="flex-1 w-full max-w-2xl">
             <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <p className="text-gray-300 text-sm font-medium">
                  <span className="text-white font-bold">New Update:</span> The "Area Tory" community hub is now officially live in the dashboard!
                </p>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
                <Plus className="w-4 h-4" />
                Write Story
             </button>
          </div>
        </div>
      </section>

      {/* Integrated Story Grid */}
      <div className="rounded-3xl overflow-hidden">
        <StoryGrid />
      </div>

      {/* Creator Engagement Section */}
      <section className="relative rounded-3xl overflow-hidden py-16 px-8 text-center bg-gradient-to-br from-red-900/10 to-black border border-white/5">
         <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full" />
         <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter">
               BECOME A <span className="text-red-600">STORYTELLER.</span>
            </h2>
            <p className="text-gray-400 text-lg font-medium mb-8">
               Have a cultural insight or a cinematic story to share? Join our growing community of African creators.
            </p>
            <button className="px-10 py-4 bg-white text-black rounded-xl font-black text-sm uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-2xl">
               Apply to Creator Program
            </button>
         </div>
      </section>
    </div>
  );
}

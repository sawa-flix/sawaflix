"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFeaturedStory, getStoryCount, getBlogSettings, getTotalViews } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import { motion } from "framer-motion";

interface FeaturedStory {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  mainImage: any;
  publishedAt: string;
  category: { title: string; color: string };
}

interface BlogSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundImage: any;
}

export default function AreaToryHero() {
  const [featured, setFeatured] = useState<FeaturedStory | null>(null);
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [storyCount, setStoryCount] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [selectedDev, setSelectedDev] = useState<any | null>(null);

  const developers = [
    { 
      id: 1, 
      name: "Fonyuy Gita", 
      role: "Lead Developer", 
      bio: "Tech innovator specializing in AI and ML. Architect of Sawaflix.", 
      img: "https://i.ibb.co/0VrHTWQD/image.png",
      github: "https://github.com/Fonyuygita"
    },
    { 
      id: 2, 
      name: "Mazehwo John Brindi", 
      role: "Assistant Lead & Backend", 
      bio: "Growing Developer focused on robust backend architectures.", 
      img: "https://i.ibb.co/6cJvhswq/Whats-App-Image-2025-07-09-at-19-44-40.jpg" 
    },
    { 
      id: 3, 
      name: "Ngam Sabastine", 
      role: "Backend Developer", 
      bio: "Design expert and backend specialist bringing precision to code.", 
      img: "https://i.ibb.co/PZSgMCwB/image.png" 
    },
    { 
      id: 17, 
      name: "Wohking", 
      role: "Backend Developer", 
      bio: "Data Science enthusiast and backend logic expert.", 
      img: "https://i.ibb.co/Z1VCg9RG/image.png" 
    },
    { 
      id: 198, 
      name: "Asime Domitila", 
      role: "Frontend Developer", 
      bio: "Bridging Data Science and modern Frontend experiences.", 
      img: "https://i.ibb.co/kLwJmv4/Whats-App-Image-2025-08-22-at-4-38-15-PM.jpg" 
    },
    { 
      id: 16, 
      name: "Victory Beleh", 
      role: "Frontend Developer", 
      bio: "Frontend engineer with a passion for Data Science and UI.", 
      img: "https://i.ibb.co/xtMSLsY7/image.png" 
    },
    { 
      id: 14, 
      name: "Kingsley", 
      role: "Frontend & Designer", 
      bio: "Computer Engineering expert crafting beautiful web interfaces.", 
      img: "https://i.ibb.co/b5cGrBBb/image.png" 
    }
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const [featuredData, count, settingsData, views] = await Promise.all([
          getFeaturedStory(),
          getStoryCount(),
          getBlogSettings(),
          getTotalViews(),
        ]);

        if (featuredData) setFeatured(featuredData);
        if (count) setStoryCount(count);
        if (settingsData) setSettings(settingsData);
        if (views) setTotalViews(views);
      } catch (error) {
        console.warn("[AreaToryHero] Failed to fetch dynamic data:", error);
      } finally {
        setLoaded(true);
      }
    }
    fetchData();
  }, []);

  const getImageUrl = (image: any, fallback: string) => {
    if (image?.asset) return urlFor(image).width(1200).height(800).fit('crop').url();
    return fallback;
  };

  const getFeaturedImage = () => {
    return getImageUrl(featured?.mainImage, "https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?q=80&w=2070&auto=format&fit=crop");
  };

  const getHeroBG = () => {
    if (settings?.heroBackgroundImage?.asset) {
      return urlFor(settings.heroBackgroundImage).width(1920).height(1080).url();
    }
    return "https://i.ibb.co/pBFfWnZP/Chat-GPT-Image-Apr-25-2026-04-40-19-AM.png";
  };

  const formatCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k+`;
    return count.toString();
  };

  return (
    <section className="relative h-[35vh] md:h-[42vh] w-full overflow-hidden flex items-center justify-center bg-[#0B0E14]">
      {/* Background with optimized image delivery */}
      <div className="absolute inset-0 z-0 bg-[#0B0E14]">
        <img
          src={getHeroBG()}
          alt=""
          fetchpriority="high"
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.55] saturate-[1.2] transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-black/30" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center md:text-left grid md:grid-cols-2 items-center gap-8">
        <div>
          {/* Tag */}
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <span className="w-8 h-[1px] bg-white hidden md:block" />
            <span className="text-white font-bold text-[10px] tracking-[0.3em]">
              Community & culture
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white mb-4">
            {settings?.heroTitle || "Area tory."}
          </h1>

          <p className="max-w-md text-[13px] md:text-sm text-gray-300 font-medium leading-relaxed opacity-80 mb-6">
            {settings?.heroSubtitle || "The heart of Sawaflix. Discover exclusive announcements, cultural stories, and our growing community."}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-lg font-bold text-xs transition-all duration-300 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/40 hover:-translate-y-0.5 active:scale-[0.97] cursor-pointer tracking-widest">
              Explore stories
            </button>
            <div className="flex items-center gap-6 px-4">
              <div className="flex flex-col items-center md:items-start cursor-default">
                <span className="text-white font-bold text-base">
                  {totalViews > 0 ? formatCount(totalViews) : "12k+"}
                </span>
                <span className="text-gray-500 text-[9px] tracking-widest font-bold">Views</span>
              </div>
              <div className="w-[1px] h-6 bg-gray-800" />
              <div className="flex flex-col items-center md:items-start cursor-default">
                <span className="text-white font-bold text-base">
                  {storyCount > 0 ? `${storyCount}` : "450"}
                </span>
                <span className="text-gray-500 text-[9px] tracking-widest font-bold">Stories</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Story Preview — Dynamic */}
        <div className="hidden md:block relative group cursor-pointer">
          <Link href={featured?.slug?.current ? `/dashboard/blogs/${featured.slug.current}` : "/dashboard/blogs"}>
            <div className="relative aspect-[16/9] w-full max-w-sm ml-auto bg-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 group-hover:border-red-600/30 group-hover:shadow-red-600/10">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${getFeaturedImage()}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span
                  className="inline-block px-2 py-0.5 text-white text-[9px] font-bold rounded-md mb-2 tracking-widest transition-transform group-hover:scale-105"
                  style={{ backgroundColor: featured?.category?.color || "#E50914" }}
                >
                  {loaded ? (featured?.category?.title || "Featured") : "Loading..."}
                </span>
                <h3 className="text-lg font-bold text-white mb-1 leading-tight group-hover:text-red-500 transition-colors">
                  {loaded ? (featured?.title || "Explore our latest stories") : "Loading..."}
                </h3>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Developers Avatar Stack — Bottom Right */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-2">
        <div className="flex items-center -space-x-2">
          {developers.map((dev) => (
            <div 
              key={dev.id}
              onClick={() => setSelectedDev(dev)}
              className="relative w-8 h-8 rounded-full border-2 border-[#0B0E14] overflow-hidden group/dev cursor-pointer transition-transform hover:scale-110 hover:z-10"
            >
              <img 
                src={dev.img} 
                alt={dev.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover/dev:opacity-100 transition-opacity" />
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-[#0B0E14] bg-red-600 flex items-center justify-center text-[10px] font-black text-white cursor-default">
            +
          </div>
        </div>
        <span className="text-gray-500 text-[8px] font-bold uppercase tracking-widest bg-black/40 px-2 py-1 rounded-full border border-white/5 backdrop-blur-sm">
          Built by <span className="text-white">Sawaflix Devs</span>
        </span>
      </div>

      {/* Developer Card Popover */}
      {selectedDev && (
        <div 
          className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
          onClick={() => setSelectedDev(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[280px] bg-[#11141B] border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full border-2 border-red-600 p-0.5 mb-4 overflow-hidden">
                <img src={selectedDev.img} alt={selectedDev.name} className="w-full h-full object-cover rounded-full" />
              </div>
              <h4 className="text-white font-black text-lg mb-1 tracking-tight">{selectedDev.name}</h4>
              <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest mb-3">{selectedDev.role}</span>
              <p className="text-gray-400 text-xs font-medium leading-relaxed mb-6 opacity-80">
                {selectedDev.bio}
              </p>
              
              <Link 
                href="/dashboard/help"
                className="w-full py-2 bg-white/5 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5"
              >
                Join the team
              </Link>
              
              <button 
                onClick={() => setSelectedDev(null)}
                className="mt-4 text-gray-600 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}

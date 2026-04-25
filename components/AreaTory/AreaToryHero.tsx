"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFeaturedStory, getStoryCount, getBlogSettings, getTotalViews } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";

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

  const getFeaturedImage = () => {
    if (featured?.mainImage?.asset) {
      return urlFor(featured.mainImage).width(600).height(340).url();
    }
    return "https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?q=80&w=2070&auto=format&fit=crop";
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
    <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden flex items-center justify-center bg-[#0B0E14]">
      {/* Background with simple deep gradient */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{
            backgroundImage: `url('${getHeroBG()}')`,
            filter: "brightness(0.55) saturate(1.2)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-black/30" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center md:text-left grid md:grid-cols-2 items-center gap-8">
        <div>
          {/* Tag */}
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <span className="w-8 h-[1px] bg-white hidden md:block" />
            <span className="text-white font-bold text-[10px] tracking-[0.3em]">
              Community & culture
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
            {settings?.heroTitle || "Area tory."}
          </h1>

          <p className="max-w-md text-sm md:text-base text-gray-300 font-medium leading-relaxed opacity-80 mb-6">
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
    </section>
  );
}

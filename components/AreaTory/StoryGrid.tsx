"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, Tag } from "lucide-react";
import Link from "next/link";

const stories = [
  {
    id: 1,
    title: "The Sacred Ngondo Festival: Spirits of the Wouri",
    category: "Culture",
    date: "Dec 12, 2024",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop",
    excerpt: "Exploring the sacred communication with water spirits (Miengu) on the banks of the Wouri River."
  },
  {
    id: 2,
    title: "Sawaflix Originals: New Creators Program Launch",
    category: "Announcement",
    date: "Jan 05, 2025",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070&auto=format&fit=crop",
    excerpt: "We're investing in local talent to bring more authentic African stories to your screen."
  },
  {
    id: 3,
    title: "Exploring Foumban: The Architectural Jewel of the West",
    category: "Tourism",
    date: "Feb 18, 2025",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb852ba3?q=80&w=2070&auto=format&fit=crop",
    excerpt: "A deep dive into the history of the Bamoun Kingdom and the architectural legacy of Sultan Njoya."
  },
  {
    id: 4,
    title: "Top 10 Afropop Hits to Watch This Season",
    category: "Music",
    date: "Mar 10, 2025",
    image: "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=1964&auto=format&fit=crop",
    excerpt: "From Mr. Leo to Stanley Enow, discover the songs dominating the Cameroonian charts."
  },
  {
    id: 5,
    title: "Preserving the Baka Polyphonic Singing",
    category: "Heritage",
    date: "Apr 02, 2025",
    image: "https://images.unsplash.com/photo-1526218626217-dc65a29bb444?q=80&w=1974&auto=format&fit=crop",
    excerpt: "How the Baka Pygmy communities use song to maintain their relationship with the rainforest."
  },
  {
    id: 6,
    title: "Collywood: The Rise of Cameroonian Cinema",
    category: "Cinema",
    date: "May 15, 2025",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop",
    excerpt: "An interview with Syndy Emade on the future of movie production in Central Africa."
  }
];

export default function StoryGrid() {
  return (
    <section className="py-24 bg-[#0B0E14] relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
              LATEST STORIES
            </h2>
            <p className="text-gray-500 font-medium max-w-lg">
              Stay updated with the most recent cultural insights, community news, and cinematic releases.
            </p>
          </div>
          <div className="flex gap-4">
            {["All", "Culture", "News", "Music"].map((cat) => (
              <button 
                key={cat}
                className="px-6 py-2 rounded-full border border-white/10 text-gray-400 text-xs font-bold hover:border-red-600 hover:text-white transition-all uppercase tracking-widest"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-red-600/50 transition-all shadow-2xl"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${story.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] to-transparent opacity-60" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-red-600/90 text-white text-[10px] font-black rounded-full uppercase tracking-widest backdrop-blur-md">
                    {story.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {story.date}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-700" />
                  <span>5 min read</span>
                </div>
                
                <h3 className="text-xl font-black text-white mb-4 group-hover:text-red-500 transition-colors leading-tight">
                  {story.title}
                </h3>
                
                <p className="text-gray-400 text-sm font-medium line-clamp-3 mb-6 leading-relaxed">
                  {story.excerpt}
                </p>

                <Link 
                  href={`/areatory/${story.id}`}
                  className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest group/link"
                >
                  Read Story 
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="flex justify-center mt-20">
          <button className="px-12 py-4 bg-white/5 border border-white/10 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            Load More Stories
          </button>
        </div>
      </div>
    </section>
  );
}

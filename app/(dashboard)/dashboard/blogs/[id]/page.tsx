"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Heart, MessageCircle, Share2, Eye, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock data - In a real app, this would be fetched from an API/DB
const stories = [
  {
    id: 1,
    title: "The sacred Ngondo festival: Spirits of the Wouri",
    category: "Culture",
    date: "Dec 12, 2024",
    author: "Sawaflix Heritage Team",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop",
    content: `
      The Ngondo festival is a traditional annual assembly of the Sawa people, particularly those in the coastal regions of Cameroon. It is a time for the community to come together and celebrate their shared heritage, but more importantly, it is a sacred time for communication with the water spirits known as Miengu.

      Held on the banks of the Wouri River in Douala, the festival attracts thousands of visitors from across the globe. The highlight of the event is the ritual diving, where messengers descend into the depths of the river to retrieve messages from the ancestors. 

      The atmosphere is electric with the sound of traditional drums and the sight of grand canoe races that test the strength and unity of the coastal clans. Beyond the spectacle, Ngondo remains a powerful symbol of identity and the enduring link between the people and their environment.
    `,
    likes: 1200,
    comments: 45,
    views: 8900,
    readTime: "6 min read"
  },
  // Adding more mock data for other IDs if needed
];

export default function StoryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);
  
  // Find the story or fallback to the first one for demo
  const story = stories.find(s => s.id === id) || stories[0];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-8 text-gray-400 hover:text-white transition-all group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-bold uppercase tracking-widest">Back to stories</span>
      </button>

      <article className="max-w-4xl mx-auto">
        {/* Header Info */}
        <div className="mb-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
            <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em]">
              {story.category}
            </span>
            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" />
              {story.readTime}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6 leading-[1.1]">
            {story.title}
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-y border-white/5 py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center font-black text-white shadow-xl shadow-red-600/20">
                S
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-sm">By {story.author}</p>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Calendar className="w-3 h-3" />
                  {story.date}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
               <button className="flex items-center gap-2 group cursor-pointer">
                  <Heart className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" />
                  <span className="text-sm font-bold text-gray-500 group-hover:text-white transition-colors">{story.likes}</span>
               </button>
               <button className="flex items-center gap-2 group cursor-pointer">
                  <MessageCircle className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                  <span className="text-sm font-bold text-gray-500 group-hover:text-white transition-colors">{story.comments}</span>
               </button>
               <button className="flex items-center gap-2 group cursor-pointer">
                  <Share2 className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
               </button>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden mb-12 shadow-2xl border border-white/5"
        >
          <Image 
            src={story.image}
            alt={story.title}
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        {/* Article Body */}
        <div className="prose prose-invert prose-lg max-w-none px-4 md:px-0">
          <div className="text-gray-300 font-medium leading-relaxed space-y-8 text-lg">
             {story.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="opacity-90">
                   {paragraph.trim()}
                </p>
             ))}
          </div>
        </div>

        {/* Engagement Footer */}
        <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">Share this story:</span>
              <div className="flex gap-3">
                 {['Facebook', 'Twitter', 'WhatsApp'].map(platform => (
                    <button key={platform} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white hover:text-black transition-all cursor-pointer">
                       {platform}
                    </button>
                 ))}
              </div>
           </div>
           
           <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
              <Eye className="w-4 h-4" />
              {story.views.toLocaleString()} Total views
           </div>
        </div>

        {/* Related Stories Section (Simple Preview) */}
        <div className="mt-32 mb-20">
           <h3 className="text-2xl font-black text-white mb-8 tracking-tighter uppercase">Related stories</h3>
           <div className="grid md:grid-cols-2 gap-8">
              <div className="group cursor-pointer">
                 <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 border border-white/10">
                    <Image src="https://images.unsplash.com/photo-1542601906990-b4d3fb852ba3?q=80&w=2070" alt="Related" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                 </div>
                 <h4 className="text-lg font-bold text-white group-hover:text-red-600 transition-colors">Exploring Foumban: The Architectural Jewel</h4>
              </div>
              <div className="group cursor-pointer">
                 <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 border border-white/10">
                    <Image src="https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=1964" alt="Related" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                 </div>
                 <h4 className="text-lg font-bold text-white group-hover:text-red-600 transition-colors">Top 10 Afropop Hits to Watch This Season</h4>
              </div>
           </div>
        </div>
      </article>
    </div>
  );
}

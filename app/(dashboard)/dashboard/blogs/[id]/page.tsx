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
        className="flex items-center gap-2 mb-6 text-gray-500 hover:text-white transition-all group cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Back to stories</span>
      </button>

      <article className="max-w-3xl mx-auto">
        {/* Header Info */}
        <div className="mb-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <span className="px-2 py-0.5 bg-red-600 text-white text-[8px] font-black rounded-md uppercase tracking-[0.2em]">
              {story.category}
            </span>
            <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              <Clock className="w-3 h-3" />
              {story.readTime}
            </div>
          </div>

          <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white mb-4 leading-[1.2]">
            {story.title}
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-y border-white/5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-red-600/10">
                S
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-xs">By {story.author}</p>
                <div className="flex items-center gap-1.5 text-gray-500 text-[10px]">
                  <Calendar className="w-2.5 h-2.5" />
                  {story.date}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5">
               <button className="flex items-center gap-1.5 group cursor-pointer">
                  <Heart className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                  <span className="text-xs font-bold text-gray-500 group-hover:text-white transition-colors">{story.likes}</span>
               </button>
               <button className="flex items-center gap-1.5 group cursor-pointer">
                  <MessageCircle className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                  <span className="text-xs font-bold text-gray-500 group-hover:text-white transition-colors">{story.comments}</span>
               </button>
               <button className="flex items-center gap-1.5 group cursor-pointer">
                  <Share2 className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
               </button>
            </div>
          </div>
        </div>

        {/* Hero Image - Scaled Down */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden mb-8 shadow-xl border border-white/5"
        >
          <Image 
            src={story.image}
            alt={story.title}
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        {/* Article Body - Compact Typography */}
        <div className="prose prose-invert prose-sm max-w-none px-4 md:px-0">
          <div className="text-gray-400 font-medium leading-relaxed space-y-6 text-sm">
             {story.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="opacity-80">
                   {paragraph.trim()}
                </p>
             ))}
          </div>
        </div>

        {/* Engagement Footer - Scaled Down */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Share story:</span>
              <div className="flex gap-2">
                 {['Facebook', 'Twitter', 'WhatsApp'].map(platform => (
                    <button key={platform} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-[9px] font-bold hover:bg-white hover:text-black transition-all cursor-pointer">
                       {platform}
                    </button>
                 ))}
              </div>
           </div>
           
           <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              <Eye className="w-3.5 h-3.5" />
              {story.views.toLocaleString()} Views
           </div>
        </div>

        {/* Related Stories Section - Compact */}
        <div className="mt-20 mb-12">
           <h3 className="text-lg font-bold text-white mb-6 tracking-tight uppercase">Related stories</h3>
           <div className="grid md:grid-cols-2 gap-6">
              <div className="group cursor-pointer">
                 <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-3 border border-white/10">
                    <Image src="https://images.unsplash.com/photo-1542601906990-b4d3fb852ba3?q=80&w=2070" alt="Related" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                 </div>
                 <h4 className="text-sm font-bold text-white group-hover:text-red-600 transition-colors">Exploring foumban: The architectural jewel</h4>
              </div>
              <div className="group cursor-pointer">
                 <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-3 border border-white/10">
                    <Image src="https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=1964" alt="Related" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                 </div>
                 <h4 className="text-sm font-bold text-white group-hover:text-red-600 transition-colors">Top 10 afropop hits to watch this season</h4>
              </div>
           </div>
        </div>
      </article>
    </div>
  );
}

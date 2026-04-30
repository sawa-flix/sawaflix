"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Upload, ArrowRightLeft, Edit3, Bell, ChevronRight } from "lucide-react";

const cards = [
  {
    id: "post",
    label: "Post",
    icon: Upload,
    href: "/creator-dashboard/post/upload",
    themeColor: "#FF3B3B", // Vibrant Red
    glow: "shadow-[0_0_40px_rgba(255,59,59,0.3)]",
    border: "border-red-500/30",
  },
  {
    id: "transfer",
    label: "Transfer",
    icon: ArrowRightLeft,
    href: "/creator-dashboard/post/transfer",
    themeColor: "#8B5CF6", // Violet
    glow: "shadow-[0_0_40px_rgba(139,92,246,0.3)]",
    border: "border-purple-500/30",
  },
];

const footerCards = [
  { title: "Artist Spotlight", subtitle: "Jatish Shakya - New Era", img: "/1.jpg" },
  { title: "Culture Beat", subtitle: "Bikutsi Rhythm - Douala", img: "/2.jpg" },
  { title: "Culture Beat", subtitle: "West Heritage - Bamenda", img: "/3.jpg" },
  { title: "Artist Spotlight", subtitle: "Teni - Afro Beats", img: "/Teni1.jpg" },
];

export default function PostTypeSelector() {
  const router = useRouter();

  return (
    <div className="relative min-h-[90vh] w-full overflow-hidden rounded-3xl">
      {/* Cinematic Background */}
      <div 
        className="absolute inset-0 z-0 scale-110 blur-[2px]"
        style={{
          backgroundImage: 'url("/headset.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-red-900/40" />
      </div>

      <div className="relative z-10 p-8 lg:p-12 space-y-16 max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center md:text-left pt-8"
        >
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
            What would you like to do?
          </h1>
          <p className="text-gray-300 text-lg font-medium max-w-2xl">
            Choose how you want to publish content to your Sawaflix profile.
          </p>
        </motion.div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card, idx) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              onClick={() => router.push(card.href)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative flex items-center h-32 px-8 rounded-3xl bg-black/40 backdrop-blur-xl border-2 ${card.border} ${card.glow} transition-all duration-300`}
            >
              <div 
                className="p-4 rounded-2xl mr-8 transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundColor: `${card.themeColor}20` }}
              >
                <card.icon 
                  className="w-10 h-10" 
                  style={{ color: card.themeColor }}
                />
              </div>
              <span className="text-4xl font-black text-white tracking-tight">
                {card.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Your Content Universe */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end md:gap-4">
            <h2 className="text-4xl font-black text-white tracking-tight">
              Your Content Universe
            </h2>
            <p className="text-gray-400 font-bold mb-1">
              Monitor and manage your content ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Drafts Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border-2 border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.1)] group hover:border-yellow-500/40 transition-colors"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500 border border-yellow-500/20">
                  <Edit3 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-white">Drafts</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Recipe", val: "Amala (In progress)", color: "text-yellow-500/60" },
                  { label: "Story", val: "Sunset (Pending)", color: "text-gray-500" },
                  { label: "Story", val: "Sunset (Pending)", color: "text-gray-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1">
                    <span className="text-gray-400 font-bold">{item.label}: <span className={item.color}>{item.val}</span></span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Notifications Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border-2 border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.1)] group hover:border-orange-500/40 transition-colors relative overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500 border border-orange-500/20">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-white">Notifications</h3>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-400 font-bold">New comment on "Fufu recipe" ... Temookssst...</p>
                <p className="text-sm text-gray-400 font-bold">Followed by <span className="text-white">@CreativeSoul</span></p>
                <p className="text-sm text-gray-400 font-bold truncate">Followed by <span className="text-white">@CreativeSoul</span> an artist mxcirec ...</p>
              </div>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-red-600 rounded-full blur-[2px]" />
            </motion.div>
          </div>
        </div>

        {/* Bottom Horizontal Cards */}
        <div className="relative pt-8 group/row">
           <div className="flex gap-6 overflow-x-auto scrollbar-none pb-4 px-2">
              {footerCards.map((card, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -8 }}
                  className="min-w-[280px] h-32 relative rounded-2xl overflow-hidden group cursor-pointer border border-white/10"
                >
                  <img src={card.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{card.title}</p>
                    <h4 className="text-sm font-black text-white">{card.subtitle}</h4>
                  </div>
                </motion.div>
              ))}
           </div>
           
           <button className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center border border-white/10 opacity-0 group-hover/row:opacity-100 transition-opacity rotate-180">
              <ChevronRight className="w-5 h-5 text-white" />
           </button>
           <button className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center border border-white/10 opacity-0 group-hover/row:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-white" />
           </button>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}


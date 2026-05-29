"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Upload, 
  ArrowRightLeft, 
  Edit3, 
  Bell, 
  TrendingUp, 
  Users, 
  Play, 
  Music,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";
import { createClient } from "../../utils/supabase/client";

export default function PostTypeSelector() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const stats = [
    { label: "Total Streams", value: "24.8K", trend: "+12%", icon: Play, color: "text-blue-400" },
    { label: "Followers", value: "1,204", trend: "+5.2%", icon: Users, color: "text-gray-100" },
    { label: "Monthly Listeners", value: "856", trend: "+2.1%", icon: Music, color: "text-emerald-400" },
    { label: "Engagement", value: "18.4%", trend: "+0.8%", icon: TrendingUp, color: "text-orange-400" },
  ];

  const recentContent = [
    { name: "Amala (Remix)", type: "Song", status: "Draft", date: "2h ago", color: "bg-yellow-500" },
    { name: "Sunset over Lagos", type: "Story", status: "Pending", date: "5h ago", color: "bg-blue-500" },
    { name: "Afro Beats 2024", type: "Collection", status: "Approved", date: "1d ago", color: "bg-emerald-500" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Artist Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 lg:p-8 bg-white/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-white/10 transition-all duration-500 group cursor-default"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={profile?.avatar_url || "/1.jpg"} 
                alt="Artist" 
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-red-600 p-1 rounded-lg border-2 border-[#0B0E14]">
               <CheckCircle2 size={12} className="text-white" fill="currentColor" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-black text-[#AAAAAA] group-hover:text-white uppercase tracking-wider cursor-default">
                 Verified Artist
               </span>
               <span className="text-gray-500 text-[11px] font-bold cursor-default">Joined Oct 2023</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-[#AAAAAA] group-hover:text-white tracking-tighter transition-colors cursor-default">
              Welcome, {profile?.full_name || 'Artist'}
            </h1>
            <p className="text-gray-500 text-sm font-medium max-w-xl cursor-default">
              Platform performance is up <span className="text-emerald-500 font-bold">8.4%</span> this week. You have <span className="text-[#AAAAAA] group-hover:text-white underline underline-offset-4 decoration-red-500 cursor-pointer">3 new notifications</span>.
            </p>
          </div>

          <div className="md:ml-auto flex gap-3">
             <button className="px-4 py-2 bg-white text-black text-xs font-black rounded-xl hover:bg-gray-200 transition-all shadow-lg active:scale-95 cursor-pointer">
               Edit Profile
             </button>
             <button className="p-2 bg-white/5 text-[#AAAAAA] hover:text-white rounded-xl hover:bg-white/10 transition-all active:scale-95 cursor-pointer">
               <Bell size={18} />
             </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            className="p-5 rounded-2xl bg-white/[0.03] shadow-lg hover:bg-white/10 active:bg-white/15 transition-all duration-300 group cursor-default"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon size={16} />
              </div>
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                <TrendingUp size={10} /> {stat.trend}
              </span>
            </div>
            <p className="text-[#AAAAAA] text-[11px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-[#AAAAAA] group-hover:text-white tracking-tight transition-colors">{stat.value}</h3>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Quick Actions */}
          <section className="space-y-3">
            <h2 className="text-sm font-black text-[#AAAAAA] uppercase tracking-widest px-1">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => router.push("/creator-dashboard/post/upload")}
                className="group relative p-6 rounded-3xl bg-white/[0.03] text-left transition-all hover:bg-white/10 active:bg-white/15 shadow-xl overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 right-0 p-6 text-white/5 transition-all duration-500 group-hover:scale-110 group-hover:text-red-500/10 group-hover:-rotate-6">
                  <Upload size={80} />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center">
                    <Plus className="text-red-500" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#AAAAAA] group-hover:text-white tracking-tight transition-colors">Create Post</h3>
                    <p className="text-gray-500 text-xs font-medium">Upload audio, video or stories</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => router.push("/creator-dashboard/post/transfer")}
                className="group relative p-6 rounded-3xl bg-white/[0.03] text-left transition-all hover:bg-white/10 active:bg-white/15 shadow-xl overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 right-0 p-6 text-white/5 transition-all duration-500 group-hover:scale-110 group-hover:text-white/10 group-hover:rotate-6">
                  <ArrowRightLeft size={80} />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <ArrowRightLeft className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#AAAAAA] group-hover:text-white tracking-tight transition-colors">Transfer Content</h3>
                    <p className="text-gray-500 text-xs font-medium">Import from other platforms</p>
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* Performance Trend */}
          <section className="p-6 rounded-3xl bg-white/[0.03] shadow-xl space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-sm font-black text-[#AAAAAA] uppercase tracking-widest">Performance Trend</h2>
               <div className="flex gap-1.5 p-1 bg-white/5 rounded-lg">
                  {['7D', '30D', '90D'].map(t => (
                    <button key={t} className={`px-2.5 py-1 rounded text-[9px] font-black transition-all cursor-pointer ${t === '7D' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>
                      {t}
                    </button>
                  ))}
               </div>
            </div>
            <div className="h-32 w-full flex items-end justify-between px-1 gap-1.5">
               {[35, 60, 40, 80, 55, 70, 45, 90, 65, 75, 50, 100].map((h, i) => (
                 <motion.div 
                    key={i} 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.03, duration: 0.8 }}
                    className={`flex-1 rounded-sm transition-all duration-300 ${i === 11 ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-white/5 group-hover:bg-white/10'}`} 
                 />
               ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
           {/* Recent Content */}
           <section className="p-6 rounded-3xl bg-white/[0.03] shadow-xl space-y-4">
              <div className="flex justify-between items-center px-1">
                 <h2 className="text-sm font-black text-[#AAAAAA] uppercase tracking-widest">Content</h2>
                 <button className="p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                    <MoreHorizontal size={16} className="text-gray-500" />
                 </button>
              </div>
              <div className="space-y-2">
                 {recentContent.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer group">
                       <div className={`w-10 h-10 rounded-lg ${item.color} bg-opacity-10 flex items-center justify-center shrink-0`}>
                          <Music className={item.color.replace('bg-', 'text-')} size={16} />
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-bold text-[#AAAAAA] group-hover:text-white transition-colors truncate">{item.name}</h4>
                          <p className="text-[10px] text-gray-500 font-bold">{item.type} • {item.date}</p>
                       </div>
                       <ArrowUpRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                 ))}
              </div>
              <button 
                onClick={() => router.push("/creator-dashboard/content")}
                className="w-full py-3 rounded-xl bg-white/5 text-[10px] font-black text-gray-500 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest cursor-pointer"
              >
                Content Manager
              </button>
           </section>

           {/* Alerts */}
           <section className="p-6 rounded-3xl bg-white/[0.03] shadow-xl space-y-4">
              <h2 className="text-sm font-black text-[#AAAAAA] uppercase tracking-widest px-1">Live Alerts</h2>
              <div className="space-y-4">
                 {[
                   { user: "CreativeSoul", action: "followed you", time: "5m ago" },
                   { user: "SawaBot", action: "verified track", time: "1h ago" },
                 ].map((alert, i) => (
                   <div key={i} className="flex items-center gap-3 group cursor-default">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-[#AAAAAA] group-hover:text-white uppercase shrink-0 shadow-sm transition-colors">
                        {alert.user[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-[#AAAAAA] group-hover:text-white font-bold leading-none transition-colors">@{alert.user} <span className="text-gray-500 font-medium">{alert.action}</span></p>
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-tighter mt-1">{alert.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}

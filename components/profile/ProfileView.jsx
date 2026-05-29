import React, { useState } from 'react';
import { 
    Globe, Twitter, Instagram, Youtube, MapPin, 
    Calendar, Award, Share2, Play, Users, 
    Video, MessageSquare, Info, LayoutGrid,
    Link as LinkIcon, ExternalLink, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileView = ({ profile }) => {
    const [activeTab, setActiveTab] = useState('home');

    if (!profile) return null;

    const platformIcons = {
        globe: Globe,
        twitter: Twitter,
        instagram: Instagram,
        youtube: Youtube
    };

    const tabs = [
        { id: 'home', label: 'Home', icon: LayoutGrid },
        { id: 'videos', label: 'Videos', icon: Video },
        { id: 'about', label: 'About', icon: Info },
    ];

    const stats = [
        { label: 'Subscribers', value: '12.5K', icon: Users },
        { label: 'Total Views', value: '1.2M', icon: Play },
        { label: 'Videos', value: '48', icon: Video },
    ];

    return (
        <div className="min-h-screen bg-[#06080C] text-white font-sans selection:bg-red-600/30">
            {/* YouTube Style Banner */}
            <div className="relative h-48 sm:h-64 md:h-[350px] w-full overflow-hidden">
                {profile.bannerImage ? (
                    <motion.img 
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        src={profile.bannerImage} 
                        alt="Banner" 
                        className="w-full h-full object-cover" 
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-[#0B0E14] to-zinc-800" />
                )}
                {/* Overlay gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#06080C] via-transparent to-black/20" />
                
                {/* Social Links on Banner (YouTube Style) */}
                <div className="absolute bottom-6 right-6 flex gap-2">
                    {profile.socialLinks?.slice(0, 3).map((link, idx) => {
                        const Icon = platformIcons[link.platform?.toLowerCase()] || Globe;
                        return (
                            <motion.a
                                key={idx}
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 transition-all"
                            >
                                <Icon className="w-4 h-4 text-white/90" />
                            </motion.a>
                        );
                    })}
                </div>
            </div>

            {/* Profile Header & Info */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex flex-col md:flex-row gap-8 items-start -mt-12 md:-mt-20">
                    {/* Profile Image with Ring Effect */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="relative group"
                    >
                        <div className="absolute -inset-1.5 bg-gradient-to-tr from-zinc-600 to-zinc-900 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-[2.2rem] border-[6px] border-[#06080C] overflow-hidden bg-[#10141D] shadow-2xl">
                            {profile.profileImage ? (
                                <img src={profile.profileImage} alt={profile.displayName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700">
                                    <Users className="w-16 h-16" />
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Basic Info & Actions */}
                    <div className="flex-1 pt-6 md:pt-24">
                        <div className="flex flex-col gap-2">
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-wrap items-center gap-3"
                            >
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-sm">
                                    {profile.displayName}
                                </h1>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                    <Award className="w-3.5 h-3.5 text-zinc-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Official Creator</span>
                                </div>
                            </motion.div>
                            
                            <motion.p 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-zinc-400 font-bold tracking-wide flex items-center gap-2"
                            >
                                <span>@{profile.username || profile.displayName?.toLowerCase().replace(/\s/g, '')}</span>
                                <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                                <span>12.5K subscribers</span>
                                <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                                <span>48 videos</span>
                            </motion.p>

                            <motion.div 
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="mt-6 flex flex-wrap items-center gap-3"
                            >
                                <button className="px-10 py-3.5 bg-white text-black rounded-full font-black text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl active:scale-95">
                                    Subscribe
                                </button>
                                <button className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group active:scale-95">
                                    <Share2 className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                                </button>
                                <button className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group active:scale-95">
                                    <Youtube className="w-5 h-5 text-zinc-400 group-hover:text-red-500" />
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mt-12 border-b border-white/5 flex gap-8 overflow-x-auto scrollbar-hide no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative pb-4 text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                                activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : ''}`} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div 
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="py-12">
                    <AnimatePresence mode="wait">
                        {activeTab === 'home' && (
                            <motion.div 
                                key="home"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-16"
                            >
                                {/* Featured Content Section (YouTube Channel Trailer Style) */}
                                <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                                    <div className="lg:col-span-7">
                                        <div className="aspect-video bg-[#10141D] rounded-[2rem] overflow-hidden border border-white/5 relative group cursor-pointer">
                                            <img 
                                                src={profile.bannerImage || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80"} 
                                                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                                                alt="Featured"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                                                    <Play className="w-8 h-8 text-white fill-current" />
                                                </div>
                                            </div>
                                            {/* Watermark Label */}
                                            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                                                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Featured Video</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-5 space-y-6">
                                        <h2 className="text-3xl font-black tracking-tight leading-tight">
                                            Exploring the Lost Rhythms: A Journey Through Heritage
                                        </h2>
                                        <p className="text-zinc-400 font-medium leading-relaxed text-lg">
                                            {profile.bio?.slice(0, 200) || "Join me on an immersive journey into the depths of cultural heritage. Discover untold stories and preserved traditions that define our shared history."}
                                            {profile.bio?.length > 200 && "..."}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                                            <span>2.4M Views</span>
                                            <span>•</span>
                                            <span>3 months ago</span>
                                        </div>
                                        <button className="flex items-center gap-2 group text-white font-black uppercase tracking-widest text-xs">
                                            Read More <ChevronRight className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </section>

                                {/* Latest Content Grid */}
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-black tracking-tight uppercase">Recent Uploads</h3>
                                        <button className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-500 transition-colors">View All</button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[1, 2, 3, 4].map((id) => (
                                            <div key={id} className="group cursor-pointer">
                                                <div className="aspect-video bg-[#10141D] rounded-2xl overflow-hidden border border-white/5 mb-3 relative">
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-300" />
                                                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-bold">12:45</div>
                                                </div>
                                                <h4 className="font-bold text-sm line-clamp-2 group-hover:text-red-500 transition-colors">Cultural Documentation Part {id}: The Hidden Gems of Sawa</h4>
                                                <p className="text-zinc-500 text-[11px] mt-1 font-bold">124K views • 2 weeks ago</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {activeTab === 'about' && (
                            <motion.div 
                                key="about"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                            >
                                <div className="lg:col-span-8 space-y-12">
                                    <section>
                                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">The Story</h3>
                                        <p className="text-zinc-300 font-medium leading-[2] text-lg whitespace-pre-wrap">
                                            {profile.bio || "This creator is yet to share their full story. Stay tuned for updates on their cultural journey and content."}
                                        </p>
                                    </section>

                                    <section>
                                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">Details</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="p-6 bg-[#10141D] border border-white/5 rounded-3xl space-y-2">
                                                <div className="flex items-center gap-3 text-zinc-500">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Location</span>
                                                </div>
                                                <p className="font-bold">{profile.location || 'Based in Cameroon / Global'}</p>
                                            </div>
                                            <div className="p-6 bg-[#10141D] border border-white/5 rounded-3xl space-y-2">
                                                <div className="flex items-center gap-3 text-zinc-500">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Member Since</span>
                                                </div>
                                                <p className="font-bold">{new Date(profile.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <div className="lg:col-span-4 space-y-10">
                                    <section className="p-8 bg-[#10141D] border border-white/5 rounded-[2.5rem] space-y-8 shadow-2xl">
                                        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Quick Stats</h3>
                                        <div className="space-y-6">
                                            {stats.map((stat, i) => (
                                                <div key={i} className="flex items-center gap-4">
                                                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                                        <stat.icon className="w-5 h-5 text-zinc-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {profile.socialLinks?.length > 0 && (
                                        <section className="space-y-4">
                                            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">Links</h3>
                                            <div className="flex flex-col gap-2">
                                                {profile.socialLinks.map((link, idx) => {
                                                    const Icon = platformIcons[link.platform?.toLowerCase()] || Globe;
                                                    return (
                                                        <a 
                                                            key={idx}
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-between p-4 bg-[#10141D] border border-white/5 rounded-2xl hover:bg-[#151a26] transition-all group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Icon className="w-4 h-4 text-zinc-500 group-hover:text-red-600 transition-colors" />
                                                                <span className="text-[11px] font-black uppercase tracking-widest capitalize">{link.platform}</span>
                                                            </div>
                                                            <ExternalLink className="w-3.5 h-3.5 text-zinc-700 group-hover:text-white transition-colors" />
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            
            {/* YouTube Style Footer Branding */}
            <div className="mt-32 py-20 border-t border-white/5 text-center">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="inline-flex items-center gap-2 mb-6 grayscale opacity-20">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-current" />
                        </div>
                        <span className="text-xl font-black tracking-tighter">SAWAFLIX</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">© 2024 SawaFlix Creator Network</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;

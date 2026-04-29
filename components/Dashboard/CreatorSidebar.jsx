'use client';
import React from 'react';
import { 
    Home,
    LayoutGrid, 
    Upload, 
    Film, 
    BarChart2, 
    MessageSquare, 
    Bell, 
    HelpCircle, 
    Settings, 
    LogOut 
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { handleSignOut } from '@/app/(auth)/actions';
import SawaflixLogo from '../SawaflixLogo';

const CreatorSidebar = ({ userProfile }) => {
    const pathname = usePathname();

    const category = userProfile?.category?.toLowerCase();
    
    // Determine specific upload path based on niche
    let uploadPath = '/creator-dashboard/upload';
    if (category === 'music' || category === 'musician') {
        uploadPath = '/creator-dashboard/post/music';
    } else if (category === 'storyteller' || category === 'stories' || category === 'storytelling') {
        uploadPath = '/creator-dashboard/post/story';
    } else if (category === 'lifestyle' || category === 'food') {
        uploadPath = '/creator-dashboard/post/food';
    }

    // 'Post' always goes to the selection page (Post vs Transfer)
    const postPath = '/creator-dashboard';

    const menuItems = [
        { name: 'Feed', icon: Home, href: '/dashboard' },
        { name: 'Post', icon: LayoutGrid, href: postPath },
        { name: 'Upload New', icon: Upload, href: uploadPath },
        { name: 'My Content', icon: Film, href: '/creator-dashboard/content' },
        { name: 'Analytics', icon: BarChart2, href: '/creator-dashboard/analytics' },
        { name: 'Comments', icon: MessageSquare, href: '/creator-dashboard/comments' },
        { name: 'Notifications', icon: Bell, href: '/dashboard/notification' },
        { name: 'Help', icon: HelpCircle, href: '/dashboard/help' },
    ];

    return (
        <div className="h-full flex flex-col bg-[#080A0F] border-r border-white/5 w-64">
            {/* Logo Section */}
            <div className="p-8 pb-4">
                <SawaflixLogo />
            </div>

            {/* Profile Section */}
            <div className="px-6 py-8 flex flex-col items-center text-center">
                <div className="relative group">
                    {/* Animated Glow Ring */}
                    <div className="absolute -inset-1 bg-gradient-to-tr from-purple-600 via-pink-500 to-red-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 shrink-0 aspect-square">
                        <img 
                            src={userProfile?.profileImage || "/0.jpg"} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <h2 className="text-white font-black text-xl tracking-tight leading-none">{userProfile?.displayName || "Creator"}</h2>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">{userProfile?.category || "Artist"}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto scrollbar-none">
                {menuItems.map((item) => {
                    const isActive = item.href === '/dashboard' 
                        ? pathname === '/dashboard' 
                        : pathname?.startsWith(item.href);
                    return (
                        <Link 
                            key={item.href}
                            href={item.href}
                            className="relative block group"
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="activeNav"
                                    className="absolute inset-0 bg-red-600 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <div className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                                isActive 
                                ? 'text-white' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}>
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                <span className="font-bold text-sm tracking-tight">{item.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 pt-4 space-y-1 border-t border-white/5">
                <Link 
                    href="/dashboard/edit-profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all group"
                >
                    <Settings className="w-5 h-5 group-hover:text-white" />
                    <span className="font-bold text-sm">Settings</span>
                </Link>
                <form action={handleSignOut}>
                    <button 
                        type="submit"
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500/80 hover:text-red-500 hover:bg-red-500/5 transition-all group"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-bold text-sm">Logout</span>
                    </button>
                </form>
            </div>

            <style jsx>{`
                @keyframes gradient-xy {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient-xy {
                    background-size: 200% 200%;
                    animation: gradient-xy 3s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default CreatorSidebar;


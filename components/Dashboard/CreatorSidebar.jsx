'use client';
import React from 'react';
import { 
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
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { handleSignOut } from '@/app/(auth)/actions';

const CreatorSidebar = ({ userProfile }) => {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
        { name: 'Upload New', icon: Upload, href: '/dashboard/upload' },
        { name: 'My Content', icon: Film, href: '/dashboard/content' },
        { name: 'Analytics', icon: BarChart2, href: '/dashboard/analytics' },
        { name: 'Comments', icon: MessageSquare, href: '/dashboard/comments' },
        { name: 'Notifications', icon: Bell, href: '/dashboard/notification' },
        { name: 'Help', icon: HelpCircle, href: '/dashboard/help' },
    ];

    return (
        <div className="h-full flex flex-col bg-[#0B0E14] border-r border-white/5 w-64">
            {/* Logo */}
            <div className="p-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                    </div>
                    <span className="text-lg font-black text-white tracking-tight">Sawa<span className="text-red-600">Flix</span></span>
                </div>
            </div>
            <div className="p-6 border-b border-white/5">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-red-600 mb-3">
                        <img 
                            src={userProfile?.profileImage || "/0.jpg"} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h2 className="text-white font-black text-lg tracking-tight">{userProfile?.displayName || "Creator"}</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{userProfile?.category || "Artist"}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                                isActive 
                                ? 'bg-red-600 text-white' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                            <span className="font-semibold text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 space-y-2 border-t border-white/5">
                <Link 
                    href="/dashboard/edit-profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all group"
                >
                    <Settings className="w-5 h-5 group-hover:text-white" />
                    <span className="font-semibold text-sm">Settings</span>
                </Link>
                <form action={handleSignOut}>
                    <button 
                        type="submit"
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-all group"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-semibold text-sm">Logout</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatorSidebar;

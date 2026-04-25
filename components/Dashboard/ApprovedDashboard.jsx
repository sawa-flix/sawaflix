'use client';
import React from 'react';
import { ExternalLink, Edit3, Sparkles } from 'lucide-react';
import CreatorDashboard from './CreatorDashboard';
import Link from 'next/link';

const ApprovedDashboard = ({ creatorName, userProfile }) => {
    // Generate slug for public profile
    const profileSlug = (userProfile?.username || creatorName || 'creator').toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-1000">
            {/* Premium Welcome Header */}
            <div className="relative group overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-[#0B0E14] border border-white/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-2xl backdrop-blur-xl">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-red-600/10 border border-red-600/20 rounded-full text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">
                            <Sparkles className="w-4 h-4" />
                            Verified SawaFlix Creator
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
                            Welcome back, <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">
                                {creatorName || userProfile?.username || 'Creator'}
                            </span>
                        </h1>
                        <p className="text-gray-400 font-medium max-w-md text-lg leading-relaxed">
                            Your cultural influence is growing. Manage your craft and track your impact from your verified dashboard.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link 
                            href={`/creator/${profileSlug}`}
                            className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs border border-white/10 transition-all uppercase tracking-widest hover:scale-105 active:scale-95"
                        >
                            <ExternalLink className="w-5 h-5 text-red-500" />
                            Public Profile
                        </Link>
                        <Link 
                            href="/updateProfile"
                            className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs transition-all shadow-2xl shadow-red-600/40 uppercase tracking-widest hover:scale-105 active:scale-95"
                        >
                            <Edit3 className="w-5 h-5" />
                            Edit Profile
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Dashboard Stats & Content */}
            <CreatorDashboard userProfile={userProfile} />
        </div>
    );
};

export default ApprovedDashboard;

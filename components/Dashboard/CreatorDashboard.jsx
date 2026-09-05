'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { 
    Users, 
    Heart, 
    Eye, 
    UploadCloud, 
    Share2, 
    Download,
    Play,
    Clock,
    CheckCircle,
    AlertCircle,
    MoreHorizontal,
    Search,
    Bell as BellIcon,
    Settings as SettingsIcon,
    ChevronDown
} from 'lucide-react';

const StatCard = ({ label, value, trend, icon: Icon, color }) => (
    <div className="relative group overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/50 to-purple-600/50 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
        <div className="relative bg-[#141820] border border-white/5 p-6 rounded-3xl transition-all group shadow-xl backdrop-blur-sm">
            <div className="flex flex-col gap-1 mb-4">
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
                <span className="text-4xl font-black text-white tracking-tight leading-none">{value}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                    <span>{trend.startsWith('+') ? '↑' : '↓'}</span>
                    {trend}
                </div>
            </div>
        </div>
    </div>
);

const ContentItem = ({ title, status, views, date, image }) => {
    const statusConfig = {
        'Published': { color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle },
        'Under Review': { color: 'text-blue-400', bg: 'bg-blue-400/10', icon: Clock },
        'Rejected': { color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertCircle },
        'Draft': { color: 'text-gray-500', bg: 'bg-gray-500/10', icon: Clock },
    };
    const config = statusConfig[status] || statusConfig['Draft'];

    return (
        <div className="flex items-center justify-between p-5 bg-[#141820]/40 border border-white/5 rounded-3xl hover:bg-[#141820] hover:border-white/10 transition-all group">
            <div className="flex items-center gap-6">
                <div 
                    className="w-28 h-16 rounded-2xl overflow-hidden bg-gray-800 border border-white/5 relative bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-500 shadow-xl"
                    style={{ backgroundImage: `url(${image || '/vid.jpg'})` }}
                >
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-red-600 p-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Play className="w-5 h-5 text-white fill-current" />
                        </div>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <h4 className="text-white font-black text-base tracking-tight leading-none group-hover:text-red-500 transition-colors">{title}</h4>
                    <div className="flex items-center gap-3">
                        <div className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full ${config.bg} ${config.color} text-[8px] font-black uppercase tracking-[0.2em]`}>
                            <config.icon className="w-3 h-3" />
                            {status}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-16">
                <div className="text-right space-y-1">
                    <div className="flex items-center justify-end gap-2 text-white font-black text-lg">
                        <Eye className="w-4 h-4 text-red-500" />
                        {views}
                    </div>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{date}</p>
                </div>
                <button className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const SimpleWaveChart = () => (
    <div className="relative w-full h-full min-h-[250px] mt-6">
        <svg viewBox="0 0 800 200" className="w-full h-full overflow-visible">
            {/* Grid Lines */}
            {[0, 50, 100, 150, 200].map(y => (
                <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="white" strokeOpacity="0.05" strokeWidth="1" />
            ))}
            
            {/* The Wave */}
            <path 
                d="M0,150 C100,160 150,80 250,110 C350,140 400,20 500,60 C600,100 700,40 800,70" 
                fill="none" 
                stroke="url(#gradient)" 
                strokeWidth="4" 
                strokeLinecap="round"
                className="drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            />
            
            {/* Area Fill */}
            <path 
                d="M0,150 C100,160 150,80 250,110 C350,140 400,20 500,60 C600,100 700,40 800,70 V200 H0 Z" 
                fill="url(#areaGradient)" 
            />

            {/* Markers */}
            <circle cx="250" cy="110" r="6" fill="#0B0E14" stroke="#DC2626" strokeWidth="3" />
            <circle cx="500" cy="60" r="6" fill="#0B0E14" stroke="#DC2626" strokeWidth="3" />
            <circle cx="710" cy="52" r="6" fill="#0B0E14" stroke="#DC2626" strokeWidth="3" />

            {/* Labels */}
            <rect x="230" y="70" width="40" height="25" rx="12.5" fill="#1A1F2B" stroke="white" strokeOpacity="0.1" />
            <text x="250" y="87" textAnchor="middle" fill="white" className="text-[10px] font-black">785</text>

            <rect x="480" y="20" width="40" height="25" rx="12.5" fill="#1A1F2B" stroke="white" strokeOpacity="0.1" />
            <text x="500" y="37" textAnchor="middle" fill="white" className="text-[10px] font-black">940</text>

            <rect x="690" y="12" width="40" height="25" rx="12.5" fill="#1A1F2B" stroke="white" strokeOpacity="0.1" />
            <text x="710" y="29" textAnchor="middle" fill="white" className="text-[10px] font-black">948</text>

            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#DC2626" />
                    <stop offset="100%" stopColor="#991B1B" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#DC2626" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

const CreatorDashboard = ({ userProfile }) => {
    const [activeTab, setActiveTab] = useState('All Contents');

    const tabs = ['All Contents', 'Published', 'Draft', 'Under Review', 'Rejected'];
    
    // Mock data for contents matching the image
    const contents = [
        { title: 'Credit Alert', status: 'Published', views: '1200', date: 'Jan 12, 2026', image: '/movie.jpg' },
        { title: 'segsdfg', status: 'Under Review', views: '0', date: 'Jan 12, 2026', image: '/r1.jpg' },
        { title: 'No fgsdr', status: 'Rejected', views: '0', date: 'Jan 12, 2026', image: '/movie.jpg' },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen">
            {/* Top Bar */}
            <div className="flex items-center justify-end gap-6 mb-8 py-2">
                <button className="text-gray-400 hover:text-white transition-colors">
                    <SettingsIcon className="w-5 h-5" />
                </button>
                <button className="relative text-gray-400 hover:text-white transition-colors">
                    <BellIcon className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-[9px] text-white flex items-center justify-center font-black">3</span>
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-white/10 group cursor-pointer">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                        <img src={userProfile?.profileImage || "/0.jpg"} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            {/* Overview Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-6">Overview</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <StatCard label="Followers" value="13K" trend="+10%" color="red" />
                    <StatCard label="Likes" value="110K" trend="-10%" color="red" />
                    <StatCard label="Views" value="800K" trend="+10%" color="red" />
                    <StatCard label="Total Uploads" value="50" trend="+10%" color="red" />
                    <StatCard label="Shares" value="145" trend="+10%" color="red" />
                </div>
            </div>

            {/* Performance Chart Section */}
            <div className="bg-[#141820] border border-white/5 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-black text-white tracking-tight">Performance Over Time</h2>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-red-600/10 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <Download className="w-4 h-4" />
                            Download Report
                        </button>
                    </div>
                </div>
                
                <SimpleWaveChart />
                
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black rounded-full border border-green-500/20">
                            +10.5%
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        10.78% Visibility
                    </div>
                </div>
            </div>

            {/* Contents List */}
            <div className="space-y-6 pb-20">
                <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-none">
                    {tabs.map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-sm font-black whitespace-nowrap transition-colors uppercase tracking-widest ${
                                activeTab === tab ? 'text-red-600' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="grid gap-3">
                    {contents.map((item, idx) => (
                        <ContentItem key={idx} {...item} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CreatorDashboard;

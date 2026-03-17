'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="bg-[#141820] border border-white/5 p-5 rounded-2xl hover:border-red-600/20 transition-all group shadow-xl">
        <div className="flex flex-col gap-1 mb-4">
            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{label}</span>
            <span className="text-3xl font-black text-white tracking-tight">{value}</span>
        </div>
        <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1 text-[10px] font-bold ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                <span className="mb-0.5">{trend.startsWith('+') ? '↑' : '↓'}</span>
                {trend} This week
            </div>
            {/* Minimal line chart preview could go here */}
        </div>
    </div>
);

const ContentItem = ({ id, type, title, status, views, date, image, onDelete, onUpdate }) => {
    const statusConfig = {
        'Published': { color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle },
        'Under Review': { color: 'text-blue-400', bg: 'bg-blue-400/10', icon: Clock },
        'Rejected': { color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertCircle },
        'Draft': { color: 'text-gray-500', bg: 'bg-gray-500/10', icon: Clock },
    };
    const config = statusConfig[status] || statusConfig['Draft'];

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(title);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(id, type);
        } finally {
            setIsDeleting(false);
            setIsMenuOpen(false);
        }
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            await onUpdate(id, type, editTitle);
            setIsEditing(false);
        } finally {
            setIsUpdating(false);
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="flex flex-col p-4 bg-[#141820]/50 border border-white/5 rounded-2xl hover:bg-[#141820] transition-all group">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4 flex-1">
                    <div
                        className="w-24 h-16 rounded-xl overflow-hidden bg-gray-800 border border-white/5 relative bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-500 flex-shrink-0"
                        style={{ backgroundImage: `url(${image || '/vid.jpg'})` }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Play className="w-6 h-6 text-white fill-current" />
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        {isEditing ? (
                            <input 
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="bg-[#0B0E14] text-sm text-white px-3 py-1.5 rounded-lg border border-gray-700 outline-none w-full max-w-[200px] focus:border-red-500/50 mb-2"
                                autoFocus
                            />
                        ) : (
                            <h4 className="text-white font-black text-sm mb-1 tracking-tight truncate max-w-[250px]">{title}</h4>
                        )}
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${config.bg} ${config.color} text-[9px] font-black uppercase tracking-widest`}>
                            <config.icon className="w-3 h-3" />
                            {status}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                        <div className="flex items-center justify-end gap-1.5 text-white font-bold text-sm">
                            <Eye className="w-4 h-4 text-gray-500" />
                            {views}
                        </div>
                        <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-0.5">{date}</p>
                    </div>

                    <div className="relative">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-gray-600 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 top-10 w-32 bg-[#1A1F2B] border border-gray-800 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                                <button 
                                    onClick={() => {
                                        setIsEditing(true);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Edit Title
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Action Row */}
            {isEditing && (
                <div className="w-full mt-4 pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                    <button 
                        onClick={() => {
                            setIsEditing(false);
                            setEditTitle(title); // Revert
                        }}
                        className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpdate}
                        disabled={isUpdating || editTitle === title}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            )}
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

const CreatorDashboard = ({ userProfile, content = [] }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('All Contents');
    const [currentPage, setCurrentPage] = useState(0);
    const PAGE_SIZE = 5;

    // --- Action Handlers ---
    const handleDeleteContent = async (id, category) => {
        const apiCategory = category === 'story' ? 'stories' : category;
        const res = await fetch(`/api/content/${id}?category=${apiCategory}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            router.refresh();
        } else {
            console.error("Failed to delete content");
            alert("Failed to delete content");
        }
    };

    const handleUpdateContent = async (id, category, newTitle) => {
        const apiCategory = category === 'story' ? 'stories' : category;
        const res = await fetch(`/api/content/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                category: apiCategory,
                title: newTitle
            })
        });

        if (res.ok) {
            router.refresh();
        } else {
            console.error("Failed to update content");
            alert("Failed to update content");
        }
    };

    const tabs = ['All Contents', 'Published', 'Draft', 'Under Review', 'Rejected'];

    // Filter content based on active tab (assuming 'status' will be added to real data later, 
    // for now we show all in 'All Contents' and 'Published')
    const filteredContent = content.filter(item => {
        if (activeTab === 'All Contents') return true;
        // Mocking status logic for now since DB might not have 'status' yet
        const status = 'Published';
        return activeTab === status;
    });

    const totalPages = Math.ceil(filteredContent.length / PAGE_SIZE);
    const paginatedContent = filteredContent.slice(
        currentPage * PAGE_SIZE, 
        (currentPage + 1) * PAGE_SIZE
    );

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(0);
    };

    // Basic stats calculation (Requirement 3 - though asked for later, it's easier to do now)
    const stats = {
        total: content.length,
        food: content.filter(c => c.type === 'food').length,
        story: content.filter(c => c.type === 'story').length,
        music: content.filter(c => c.type === 'music').length
    };

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
                    <StatCard label="Total Uploads" value={stats.total} trend="+10%" color="red" />
                    <StatCard label="Stories" value={stats.story} trend="+0%" color="red" />
                    <StatCard label="Food" value={stats.food} trend="+0%" color="red" />
                    <StatCard label="Music" value={stats.music} trend="+0%" color="red" />
                    <StatCard label="Views" value="0" trend="+0%" color="red" />
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
                            onClick={() => handleTabChange(tab)}
                            className={`text-sm font-black whitespace-nowrap transition-colors uppercase tracking-widest ${activeTab === tab ? 'text-red-600' : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="grid gap-3">
                    {paginatedContent.length > 0 ? (
                        paginatedContent.map((item, idx) => (
                            <ContentItem
                                key={item.id || idx}
                                id={item.id}
                                type={item.type}
                                title={item.title || item.dish_name || 'Untitled'}
                                status="Published" 
                                views="0"
                                date={new Date(item.submission_date || item.updated_at).toLocaleDateString()}
                                image={item.type === 'food' ? '/food-placeholder.jpg' : item.type === 'music' ? '/music-placeholder.jpg' : '/story-placeholder.jpg'}
                                onDelete={handleDeleteContent}
                                onUpdate={handleUpdateContent}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 bg-[#141820]/30 rounded-2xl border border-dashed border-white/5">
                            <p className="text-gray-500 text-sm font-medium">No content found for this category</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            Page {currentPage + 1} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                                className="px-4 py-2 bg-[#141820] border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:border-red-600/50 transition-all"
                            >
                                Previous
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={currentPage === totalPages - 1}
                                className="px-4 py-2 bg-[#141820] border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:border-red-600/50 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatorDashboard;

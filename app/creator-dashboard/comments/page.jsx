"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Filter,
  MoreVertical,
  Reply,
  Heart,
  Trash2,
  CheckCircle,
  Clock,
  ThumbsDown,
  ChevronDown
} from "lucide-react";

// Mock Data for Comments
const MOCK_COMMENTS = [
  {
    id: 1,
    user: {
      name: "Alex Rivera",
      handle: "@alexR_music",
      avatar: "/artists/artist1.jpg" // Using an existing dummy path or placeholder
    },
    content: {
      title: "Midnight Symphony (Remastered)",
      thumbnail: "/api/placeholder/120/80",
      type: "Music"
    },
    text: "This track is exactly what I needed today. The bassline completely changes the vibe compared to the original mix. Incredible work!",
    timestamp: "2 hours ago",
    likes: 45,
    isLiked: false,
    status: "published" // published, held
  },
  {
    id: 2,
    user: {
      name: "Sarah Jenkins",
      handle: "@sj_creates",
      avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    content: {
      title: "Behind the Scenes: Sawaflix VLOG",
      thumbnail: "/api/placeholder/120/80",
      type: "Video"
    },
    text: "Can you drop the link to the camera gear you're using? The cinematic quality in this vlog is absolutely insane.",
    timestamp: "5 hours ago",
    likes: 12,
    isLiked: true,
    status: "published"
  },
  {
    id: 3,
    user: {
      name: "TrollBot99",
      handle: "@troll_guy",
      avatar: "https://i.pravatar.cc/150?u=troll"
    },
    content: {
      title: "How to master audio mixing",
      thumbnail: "/api/placeholder/120/80",
      type: "Tutorial"
    },
    text: "Spam link http://suspicious-link.com check out my stuff here instead free money",
    timestamp: "1 day ago",
    likes: 0,
    isLiked: false,
    status: "held"
  },
  {
    id: 4,
    user: {
      name: "Marcus Cole",
      handle: "@marcus_beats",
      avatar: "https://i.pravatar.cc/150?u=marcus"
    },
    content: {
      title: "Midnight Symphony (Remastered)",
      thumbnail: "/api/placeholder/120/80",
      type: "Music"
    },
    text: "Can we get a breakdown of the synths you used here? It sounds like an analog Moog but I want to be sure.",
    timestamp: "2 days ago",
    likes: 89,
    isLiked: false,
    status: "published"
  }
];

export default function CommentsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "all", label: "All Comments" },
    { id: "unreplied", label: "I Haven't Replied" },
    { id: "held", label: "Held for Review", count: comments.filter(c => c.status === 'held').length }
  ];

  // Filtering Logic
  const filteredComments = comments.filter((comment) => {
    // Tab Filter
    if (activeTab === "held" && comment.status !== "held") return false;
    if (activeTab === "all" && comment.status === "held") return false; // Usually hide held in 'all' depending on preference

    // Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!comment.text.toLowerCase().includes(q) && 
          !comment.user.name.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleDelete = (id) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const handleApprove = (id) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, status: "published" } : c));
  };

  const toggleLike = (id) => {
    setComments(prev => prev.map(c => {
      if (c.id === id) {
        return { 
          ...c, 
          isLiked: !c.isLiked, 
          likes: c.isLiked ? c.likes - 1 : c.likes + 1 
        };
      }
      return c;
    }));
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white p-6 md:p-10 font-sans">
      
      {/* Header Section */}
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
              Comments <span className="text-red-500">Manager</span>
            </h1>
            <p className="text-gray-400 text-sm max-w-xl">
              Engage with your audience, moderate discussions, and build your community. 
              Review held comments to keep your comment section clean and welcoming.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#1A1F2B] border border-gray-800 rounded-lg p-4 flex items-center justify-between min-w-[160px]">
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Published</p>
                <p className="text-2xl font-black text-white">{comments.filter(c => c.status === 'published').length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-gray-700" />
            </div>
            {comments.filter(c => c.status === 'held').length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center justify-between min-w-[160px]">
                <div>
                  <p className="text-red-400/80 text-xs font-bold uppercase tracking-wider mb-1">Needs Review</p>
                  <p className="text-2xl font-black text-red-500">{comments.filter(c => c.status === 'held').length}</p>
                </div>
                <Clock className="w-8 h-8 text-red-500/50" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-[#0B0E14]/90 backdrop-blur-md pt-4 pb-4 border-b border-gray-800/80 mb-8 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                activeTab === tab.id
                  ? "bg-red-600/10 text-red-500"
                  : "bg-transparent text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 border border-red-500/30 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative group w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1F2B]/50 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
            />
          </div>
          <button className="flex items-center justify-center p-2.5 bg-[#1A1F2B]/50 border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Feed */}
      <div className="max-w-4xl mx-auto space-y-6">
        <AnimatePresence>
          {filteredComments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 px-6 border border-dashed border-gray-800 rounded-2xl bg-[#1A1F2B]/20"
            >
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-300 mb-2">No comments found</h3>
              <p className="text-gray-500 text-sm">
                {searchQuery 
                  ? "Try adjusting your search query." 
                  : "You're all caught up! No comments to display in this tab."}
              </p>
            </motion.div>
          ) : (
            filteredComments.map((comment) => (
              <motion.div
                key={comment.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative bg-[#1A1F2B]/40 backdrop-blur-sm border border-gray-800/80 rounded-2xl p-5 transition-all hover:border-gray-700 hover:shadow-xl hover:shadow-black/20"
              >
                {/* Status Indicator for Held */}
                {comment.status === "held" && (
                  <div className="absolute top-0 right-0 py-1 px-3 bg-red-500/10 border-b border-l border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl rounded-tr-2xl">
                    Held for Review
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Left: User Avatar & Comment Content */}
                  <div className="flex-1 flex gap-4">
                    {/* Avatar */}
                    <div className="shrink-0 pt-1">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700 relative bg-gray-900">
                        {comment.user.avatar.startsWith('http') ? (
                          <img src={comment.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <Image src={comment.user.avatar} alt="Avatar" fill className="object-cover" unoptimized 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                          />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-gray-200 text-sm">{comment.user.name}</span>
                        <span className="text-xs text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed mb-4 break-words">
                        {comment.text}
                      </p>

                      {/* Comment Actions */}
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                          <Reply className="w-3.5 h-3.5" /> Reply
                        </button>
                        
                        <button 
                          onClick={() => toggleLike(comment.id)}
                          className={`flex items-center gap-1.5 transition-colors ${comment.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-current' : ''}`} /> 
                          {comment.likes > 0 && comment.likes}
                        </button>
                        
                        {comment.status === "held" && (
                           <button 
                             onClick={() => handleApprove(comment.id)}
                             className="flex items-center gap-1.5 text-green-500/80 hover:text-green-500 transition-colors ml-auto"
                           >
                             <CheckCircle className="w-3.5 h-3.5" /> Approve
                           </button>
                        )}
                        
                        <button 
                          onClick={() => handleDelete(comment.id)}
                          className={`flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors ${comment.status === "held" ? '' : 'ml-auto'}`}
                          title="Delete Comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Content Reference Card */}
                  <div className="sm:w-56 shrink-0 border border-gray-800 rounded-xl bg-[#0B0E14]/50 overflow-hidden flex flex-row sm:flex-col group-hover:border-gray-700 transition-colors">
                    <div className="w-24 sm:w-full aspect-video sm:h-24 relative bg-gray-900 shrink-0">
                      {/* Using a solid color as fallback if placeholder fails */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center">
                         <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{comment.content.type}</span>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col justify-center min-w-0">
                      <p className="text-xs text-gray-500 mb-1 leading-none">{comment.content.type}</p>
                      <p className="text-sm font-bold text-gray-200 truncate group-hover:text-white transition-colors">
                        {comment.content.title}
                      </p>
                    </div>
                  </div>

                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

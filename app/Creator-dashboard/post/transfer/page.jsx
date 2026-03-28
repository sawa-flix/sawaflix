"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  FileText,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowLeft,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ----------- Nebula Background Components -----------
const NebulaBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-[#020408]">
    {/* Base nebula glows */}
    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[150px] rounded-full animate-pulse" />
    <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-rose-900/15 blur-[100px] rounded-full" />
    
    {/* Stars/Dust effect */}
    <div className="absolute inset-0 opacity-30" style={{ 
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
        backgroundSize: '40px 40px' 
    }} />
  </div>
);

// ----------- Neon Gradient Border Wrapper -----------
const NeonCard = ({ children }) => (
  <div className="relative group p-[1px] rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]">
    {/* Animated Border Gradient */}
    <div className="absolute inset-0 bg-gradient-to-tr from-[#3b82f6] via-[#8b5cf6] to-[#ec4899] opacity-70 group-hover:opacity-100 transition-opacity" />
    
    {/* Inner Card content */}
    <div className="relative bg-[#0B0F1A]/90 backdrop-blur-3xl rounded-[31px] p-8 md:p-10 space-y-10 border border-white/5">
        {children}
    </div>
  </div>
);

export default function TransferPage() {
  const router = useRouter();

  // --- Form State ---
  const [form, setForm] = useState({
    contentLink: "",
    description: "",
    tags: ""
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contentLink.trim()) {
      showToast("error", "Please provide a content link");
      return;
    }
    setLoading(true);
    try {
      // Logic for transfer would go here
      await new Promise(r => setTimeout(r, 2000));
      showToast("success", "Transfer initiated! Check your content dashboard soon.");
      setTimeout(() => router.push("/creator-dashboard/content"), 2500);
    } catch (err) {
      showToast("error", "Failed to initiate transfer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen py-20 px-4 scroll-smooth">
      <NebulaBackground />

      <div className="max-w-2xl mx-auto space-y-12">
        
        {/* Header Section */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
        >
            <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-2xl">
                Transfer Content
            </h1>
            <p className="text-gray-400 font-medium">
                Bridge your stories from YouTube or TikTok directly into Sawaflix.
            </p>
        </motion.div>

        {/* Main Neon Card */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
        >
            <NeonCard>
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Content Link Field */}
                    <div className="space-y-4">
                        <label className="text-sm font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                             Content Link
                        </label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-violet-500 transition-colors">
                                <LinkIcon size={20} />
                            </div>
                            <input 
                                name="contentLink"
                                value={form.contentLink}
                                onChange={handleInput}
                                placeholder="Paste TikTok or YouTube link"
                                className="w-full bg-[#080B14]/80 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-gray-600 outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Description Field */}
                    <div className="space-y-4">
                        <label className="text-sm font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                             Description
                        </label>
                        <textarea 
                            name="description"
                            value={form.description}
                            onChange={handleInput}
                            placeholder="Enter a description..."
                            rows={4}
                            className="w-full bg-[#080B14]/80 border border-white/5 rounded-2xl py-5 px-6 text-white placeholder:text-gray-600 outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all shadow-inner resize-none leading-relaxed"
                        />
                    </div>

                    {/* Tags Field */}
                    <div className="space-y-4">
                        <label className="text-sm font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                             Tags
                        </label>
                        <input 
                            name="tags"
                            value={form.tags}
                            onChange={handleInput}
                            placeholder="Add tags, separated by commas"
                            className="w-full bg-[#080B14]/80 border border-white/5 rounded-2xl py-5 px-6 text-white placeholder:text-gray-600 outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all shadow-inner"
                        />
                    </div>

                    {/* Thumbnail Upload Section */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <label className="text-sm font-black text-gray-300 uppercase tracking-widest">
                            Thumbnail Upload
                        </label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center gap-6 hover:bg-white/5 hover:border-violet-500/30 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={(e) => setThumbnail(e.target.files[0])}
                                accept="image/*"
                            />
                            
                            {thumbnail ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                                        <CheckCircle2 size={24} className="text-green-500" />
                                    </div>
                                    <p className="text-sm font-bold text-white">{thumbnail.name}</p>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setThumbnail(null); }}
                                        className="text-xs text-red-400 hover:text-red-300 font-bold uppercase"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                        <ImageIcon size={32} className="text-gray-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-white">Upload Thumbnail</p>
                                        <p className="text-sm text-gray-500 font-medium mt-1">Choose a thumbnail image to upload</p>
                                    </div>
                                    <div className="bg-white/10 hover:bg-white/20 text-white font-black px-10 py-3 rounded-xl text-xs uppercase tracking-widest transition-colors backdrop-blur-md">
                                        Browse
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button 
                            type="submit"
                            disabled={loading}
                            className={`w-full h-16 bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 text-white font-black rounded-2xl text-lg uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)] active:scale-[0.98] ${loading ? 'opacity-70' : 'hover:shadow-[0_0_50px_-5px_rgba(139,92,246,0.7)] hover:brightness-110'}`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <Loader2 className="animate-spin" size={24} />
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                "Transfer Content"
                            )}
                        </button>
                    </div>

                </form>
            </NeonCard>
        </motion.div>

        {/* Home Button */}
        <div className="text-center pt-8">
            <button 
                onClick={() => router.push('/creator-dashboard')}
                className="text-gray-500 hover:text-white transition-colors text-sm font-black uppercase tracking-widest flex items-center gap-2 mx-auto"
            >
                <ArrowLeft size={16} />
                Return to Dashboard
            </button>
        </div>
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`fixed bottom-10 right-10 z-[100] p-6 rounded-2xl border flex items-center gap-4 shadow-2xl backdrop-blur-3xl ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
            >
                {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <p className="text-sm font-bold tracking-tight">{toast.text}</p>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

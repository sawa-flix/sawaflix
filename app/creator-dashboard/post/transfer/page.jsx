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
import ThumbnailUploader from "@/components/Dashboard/ThumbnailUploader";

export default function TransferPage() {
  const router = useRouter();

  // --- Form State ---
  const [form, setForm] = useState({
    contentLink: "",
    description: "",
  });
  const [tags, setTags] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

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

  const inputClass = "w-full bg-[#080E1C] border border-gray-800 rounded-xl py-3.5 px-5 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-gray-600";

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col items-center text-center pt-8 space-y-3">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 mb-2">
          <LinkIcon className="text-red-500" size={32} />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Transfer Content</h1>
        <p className="text-gray-400 max-w-md mx-auto">Import your stories or music from other platforms directly into Sawaflix.</p>
      </div>

      <div className="space-y-12">
        {/* Main Section */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-200">Transfer Details</h2>
            <div className="h-[1px] flex-1 bg-gray-800" />
          </div>

          <form onSubmit={handleSubmit} className="bg-[#0E1628]/40 border border-gray-800/60 rounded-3xl p-8 backdrop-blur-md space-y-8">
            <div className="grid grid-cols-1 gap-y-8">
              
              {/* Content Link */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 ml-1 flex items-center gap-2">
                  <Link2 size={16} className="text-gray-500" />
                  Content Link*
                </label>
                <input
                  name="contentLink"
                  value={form.contentLink}
                  onChange={handleInput}
                  placeholder="Paste TikTok or YouTube link"
                  className={inputClass}
                  autoComplete="off"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 ml-1 flex items-center gap-2">
                  <FileText size={16} className="text-gray-500" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInput}
                  rows={4}
                  placeholder="Tell your audience what this content is about..."
                  className={`${inputClass} resize-none leading-relaxed`}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 ml-1 flex items-center gap-2">
                  <Tag size={16} className="text-gray-500" />
                  Tags (comma separated)
                </label>
                <input
                  name="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. cultural, dance, upbeat"
                  className={inputClass}
                />
              </div>

              {/* Thumbnail */}
              <div className="space-y-4 pt-4 border-t border-gray-800/50">
                <label className="text-sm font-bold text-gray-300 ml-1">Thumbnail Upload</label>
                <ThumbnailUploader
                  file={thumbnail}
                  onSelect={setThumbnail}
                  onRemove={() => setThumbnail(null)}
                  label="Thumbnail"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="px-8 h-12 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm border border-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-12 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-600/20"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    <LinkIcon size={18} />
                    Transfer Content
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-10 right-10 z-[100] p-6 rounded-2xl border flex items-center gap-4 shadow-2xl backdrop-blur-xl ${toast.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${toast.type === "success" ? "bg-green-500/20" : "bg-red-500/20"}`}>
              {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>
            <p className="text-sm font-medium">{toast.text}</p>
            <button onClick={() => setToast(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors ml-4">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Link2,
  FileText,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  Music,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { contentService } from "@/services/contentService";
import { BACKEND_URL } from "@/lib/apiConfig";
import ThumbnailUploader from "@/components/Dashboard/ThumbnailUploader";

// --- Sub-component: FileUploadZone ---
const MainFileUploadZone = ({ file, onFileSelect, onRemove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`w-full border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer group relative flex flex-col items-center justify-center
        ${file ? 'border-red-500/50 bg-red-500/5' : 'border-gray-800 bg-black/10 hover:border-gray-500/40 hover:bg-white/5'}
        ${isDragging ? 'border-red-500 bg-red-500/10 scale-[1.01]' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,video/*"
        onChange={handleChange}
        className="hidden"
      />

      {file ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
            {file.type.startsWith('video') ? <Video className="text-red-500" size={28} /> : <Music className="text-red-500" size={28} />}
          </div>
          <p className="text-sm font-bold text-white line-clamp-1">{file.name}</p>
          <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors z-10"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#111827] flex items-center justify-center mb-6 border border-gray-800 group-hover:scale-110 transition-transform">
            <div className="relative">
               <Music className="text-gray-500 group-hover:text-red-500 transition-colors" size={24} />
               <Video className="absolute -bottom-2 -right-2 text-gray-500 group-hover:text-red-500 transition-colors" size={18} />
            </div>
          </div>
          <p className="text-gray-400 font-medium mb-1">
            Drag and drop your audio or video file here, or <span className="text-red-500">click to upload</span>.
          </p>
          <p className="text-xs text-gray-600">Supports MP3, WAV, MP4, MOV (Max 500MB)</p>
        </div>
      )}
    </div>
  );
};

export default function UnifiedUploadPage() {
  const router = useRouter();

  // --- Form State ---
  const [form, setForm] = useState({
    contentLink: "",
    description: "",
  });
  const [tags, setTags] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
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
    if (!mediaFile) {
      showToast("error", "Please provide a file to upload");
      return;
    }
    
    setLoading(true);
    try {
      const { createClient } = require('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const formData = new FormData();
      formData.append("title", form.contentLink || "Untitled Content");
      formData.append("description", form.description || "No description");
      formData.append("tags", tags || "");

      // Determine category and endpoint dynamically based on file type
      const isVideo = mediaFile.type.startsWith('video');
      const endpointPath = isVideo ? '/api/content/movie/upload' : '/api/content/music/upload';
      
      // Append the file using the exact field name the backend expects for that category
      if (isVideo) {
        formData.append("video", mediaFile); // movie endpoint expects 'video'
      } else {
        formData.append("audio", mediaFile); // music endpoint expects 'audio'
        formData.append("genre", "Other");   // music endpoint requires 'genre'
      }

      // We omit thumbnail here unless specifically required to prevent Multer "Unexpected field" crashes

      // Send POST request to the correct category endpoint
      const res = await fetch(`${BACKEND_URL}${endpointPath}`, {
        method: "POST",
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });

      if (!res.ok) {
        let errMsg = `Upload failed with status: ${res.status}`;
        try {
          const errText = await res.text();
          try {
             const errData = JSON.parse(errText);
             errMsg = errData.error || errData.message || errMsg;
          } catch(e) {
             errMsg = errText.slice(0, 200); // Take first 200 chars of HTML/Text error
          }
        } catch(e) {}
        throw new Error(errMsg);
      }

      const responseData = await res.json();
      console.log("Upload Success:", responseData);
      
      showToast("success", "Content uploaded successfully!");
      setTimeout(() => router.push("/creator-dashboard/content"), 2000);
    } catch (err) {
      console.error("Upload Error:", err);
      showToast("error", err.message || "Failed to upload content.");
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
          <Upload className="text-red-500" size={32} />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Upload Content</h1>
        <p className="text-gray-400 max-w-md mx-auto">Upload new music, podcast, or stories directly to Sawaflix.</p>
      </div>

      <div className="space-y-12">
        {/* Main Section */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-200">Upload Details</h2>
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
                  placeholder="Paste music or media file link (e.g., from Dropbox or Google Drive)"
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
                  placeholder="e.g., electronic, afrobeat, podcast, dance"
                  className={inputClass}
                />
              </div>

              {/* Main File Upload Zone */}
              <div className="space-y-4">
                <MainFileUploadZone
                  file={mediaFile}
                  onFileSelect={setMediaFile}
                  onRemove={() => setMediaFile(null)}
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
            <div className="flex items-center justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-16 h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={22} />
                    Submit Content
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

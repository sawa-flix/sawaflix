"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Image as ImageIcon,
    FileText,
    Music,
    X,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Save
} from 'lucide-react';


// --- Sub-component: FileUploadZone (Native Implementation) ---
const FileUploadZone = ({ title, icon: Icon, accept, file, onFileSelect, onRemove }) => {
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
        <div className="flex flex-col items-center gap-3 w-full">
            <p className="text-gray-200 font-bold text-lg mb-1">{title}</p>
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`w-full aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all cursor-pointer group relative overflow-hidden
          ${file ? 'border-red-500/50 bg-red-500/5' : 'border-gray-700 bg-black/20 hover:border-red-500/40 hover:bg-red-500/5'}
          ${isDragging ? 'border-red-500 bg-red-500/10 scale-[1.02]' : ''}
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={Object.values(accept).flat().join(',')}
                    onChange={handleChange}
                    className="hidden"
                />

                {file ? (
                    <div className="flex flex-col items-center gap-2 p-4 text-center w-full h-full justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                            <Icon className="text-red-500" size={24} />
                        </div>
                        <p className="text-xs font-medium text-white line-clamp-1 px-4 w-full">{file.name}</p>
                        <p className="text-[10px] text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors z-10"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center p-6">
                        <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Icon className="text-gray-400 group-hover:text-red-500 transition-colors" size={28} />
                        </div>
                        <p className="text-xs text-gray-500 mb-4 px-8 leading-relaxed">
                            Drag and drop or click to <br /> <span className="text-gray-300 font-bold">browse {title.toLowerCase()}</span>
                        </p>
                        <div className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-tighter rounded-full">
                            Browse file
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function PostStoryPage() {
    // --- Form State ---
    const [formData, setFormData] = useState({
        title: '',
        ethnicGroup: '',
        description: '',
        significance: '',
    });
    const [mediaFiles, setMediaFiles] = useState({
        cover: null,
        text: null,
        audio: null,
    });

    // --- UI States ---
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [isDrafting, setIsDrafting] = useState(false);

    // --- Local Storage Hooks ---
    useEffect(() => {
        const saved = localStorage.getItem('sawaflix_story_draft');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.formData) setFormData(parsed.formData);
            } catch (e) {
                console.error("Failed to load draft");
            }
        }
    }, []);

    const saveDraft = () => {
        setIsDrafting(true);
        localStorage.setItem('sawaflix_story_draft', JSON.stringify({ formData }));
        setTimeout(() => {
            setIsDrafting(false);
            setMessage({ type: 'success', text: 'Draft saved successfully!' });
        }, 800);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.ethnicGroup || !formData.description || !formData.significance) {
            setMessage({ type: 'error', text: 'Please fill in all required fields (*)' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('community_group', formData.ethnicGroup);

            // Combine description and significance for the stories API
            const fullContent = `DESCRIPTION:\n${formData.description}\n\nSIGNIFICANCE:\n${formData.significance}`;
            payload.append('content_text', fullContent);

            // Determine content type: audio if audio file is present, otherwise text
            const contentType = mediaFiles.audio ? 'audio' : 'text';
            payload.append('content_type', contentType);

            // Languages (required by API)
            payload.append('languages', 'English');

            if (mediaFiles.cover) payload.append('cover', mediaFiles.cover);
            if (mediaFiles.audio) payload.append('media', mediaFiles.audio);
            // If there's a text file, it could be handled by a different endpoint or added to content_text
            // For now, we follow the story upload route which uses content_text or media (audio/video)

            const res = await fetch('/api/content/stories/upload', {
                method: 'POST',
                body: payload,
            });

            const result = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Story published successfully! Redirecting...' });
                localStorage.removeItem('sawaflix_story_draft');
                setTimeout(() => window.location.href = '/Creator-dashboard/content', 2000);
            } else {
                setMessage({ type: 'error', text: result.error || 'Upload failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network connection error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

            {/* Header Section */}
            <div className="flex items-center justify-center mb-12">
                <h1 className="text-4xl font-black text-white tracking-tight">Upload <span className="text-red-600">Content</span></h1>
            </div>

            <div className="space-y-12">

                {/* DESCRIPTIONS SECTION */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-2xl font-black text-white italic tracking-widest uppercase text-sm opacity-50">Descriptions</h2>
                        <div className="h-[1px] flex-1 bg-gray-800/50" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-[#0F172A]/40 border border-gray-800/50 rounded-[2.5rem] p-10 space-y-8 backdrop-blur-sm">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Title*</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter your title"
                                    className="w-full bg-black/20 border border-gray-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-red-500/50 focus:bg-black/40 outline-none transition-all placeholder:text-gray-700 font-medium"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Description*</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={6}
                                    placeholder="Enter the description"
                                    className="w-full bg-black/20 border border-gray-800 rounded-[2rem] py-4 px-6 text-sm text-white focus:border-red-500/50 focus:bg-black/40 outline-none transition-all placeholder:text-gray-700 resize-none font-medium leading-relaxed"
                                />
                            </div>
                        </div>

                        <div className="bg-[#0F172A]/40 border border-gray-800/50 rounded-[2.5rem] p-10 space-y-8 backdrop-blur-sm">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Ethnic Group*</label>
                                <div className="relative group">
                                    <select
                                        name="ethnicGroup"
                                        value={formData.ethnicGroup}
                                        onChange={handleInputChange}
                                        className="w-full bg-black/20 border border-gray-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-red-500/50 focus:bg-black/40 outline-none transition-all appearance-none cursor-pointer font-medium"
                                    >
                                        <option value="" className="bg-[#0F172A]">Choose your ethnic group</option>
                                        <option value="Sawa" className="bg-[#0F172A]">Sawa (Coastals)</option>
                                        <option value="Grassfields" className="bg-[#0F172A]">Grassfields</option>
                                        <option value="Fang-Beti" className="bg-[#0F172A]">Fang-Beti</option>
                                        <option value="Sudano-Sahelian" className="bg-[#0F172A]">Sudano-Sahelian</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 group-focus-within:text-red-500 transition-colors">
                                        <Upload size={14} className="rotate-180" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Significance*</label>
                                <textarea
                                    name="significance"
                                    value={formData.significance}
                                    onChange={handleInputChange}
                                    rows={6}
                                    placeholder="Enter the significance"
                                    className="w-full bg-black/20 border border-gray-800 rounded-[2rem] py-4 px-6 text-sm text-white focus:border-red-500/50 focus:bg-black/40 outline-none transition-all placeholder:text-gray-700 resize-none font-medium leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* PROPERTIES SECTION */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-2xl font-black text-white italic tracking-widest uppercase text-sm opacity-50">Properties</h2>
                        <div className="h-[1px] flex-1 bg-gray-800/50" />
                    </div>

                    <div className="bg-[#0F172A]/40 border border-gray-800/50 rounded-[3rem] p-10 md:p-16 backdrop-blur-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
                            <FileUploadZone
                                title="Cover Image"
                                icon={ImageIcon}
                                accept={{ "image/*": [".jpeg", ".png", ".jpg", ".webp"] }}
                                file={mediaFiles.cover}
                                onFileSelect={(f) => setMediaFiles(prev => ({ ...prev, cover: f }))}
                                onRemove={() => setMediaFiles(prev => ({ ...prev, cover: null }))}
                            />
                            <FileUploadZone
                                title="Text File"
                                icon={FileText}
                                accept={{ "application/pdf": [".pdf"], "text/plain": [".txt"] }}
                                file={mediaFiles.text}
                                onFileSelect={(f) => setMediaFiles(prev => ({ ...prev, text: f }))}
                                onRemove={() => setMediaFiles(prev => ({ ...prev, text: null }))}
                            />
                            <FileUploadZone
                                title="Audio File"
                                icon={Music}
                                accept={{ "audio/*": [".mp3", ".wav", ".m4a"] }}
                                file={mediaFiles.audio}
                                onFileSelect={(f) => setMediaFiles(prev => ({ ...prev, audio: f }))}
                                onRemove={() => setMediaFiles(prev => ({ ...prev, audio: null }))}
                            />
                        </div>
                    </div>
                </section>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-6 pt-10">
                    <button
                        onClick={saveDraft}
                        disabled={loading || isDrafting}
                        className="px-10 h-16 bg-white hover:bg-gray-100 text-red-600 font-black rounded-2xl transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                    >
                        {isDrafting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save As Draft</>}
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="px-12 h-16 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-red-600/30 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Upload size={18} /> Upload Story</>}
                    </button>
                </div>

            </div>

            {/* Notifications */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`fixed bottom-10 right-10 z-[100] p-6 rounded-[2rem] border-2 flex items-center gap-5 shadow-3xl backdrop-blur-2xl ${message.type === 'success'
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${message.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        </div>
                        <div className="flex flex-col pr-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">{message.type === 'success' ? 'Successful' : 'Alert'}</p>
                            <p className="text-sm font-bold leading-tight">{message.text}</p>
                        </div>
                        <button onClick={() => setMessage(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

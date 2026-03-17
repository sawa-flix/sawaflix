"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon,
    FileText,
    Music,
    Video,
    X,
    CheckCircle2,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- Sub-component: FileUploadZone ---
const FileUploadZone = ({ title, icon: Icon, accept, file, onFileSelect, onRemove }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
        else if (e.type === "dragleave") setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
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
        <div className="flex flex-col items-center gap-4 w-full">
            <p className="text-gray-100 font-bold text-lg">{title}</p>
            <div
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`w-full aspect-square flex flex-col items-center justify-center border border-dashed rounded-3xl transition-all cursor-pointer group relative overflow-hidden
          ${file ? 'border-red-500/50 bg-red-500/5' : 'border-gray-700 bg-black/10 hover:border-gray-500/40 hover:bg-white/5'}
          ${isDragging ? 'border-red-500 bg-red-500/10 scale-[1.02]' : ''}`}
            >
                <input ref={inputRef} type="file" accept={Object.values(accept).flat().join(',')} onChange={handleChange} className="hidden" />
                {file ? (
                    <div className="flex flex-col items-center gap-2 p-4 text-center w-full h-full justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                            <Icon className="text-red-500" size={24} />
                        </div>
                        <p className="text-xs font-semibold text-white px-4 w-full truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors z-10">
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center p-6">
                        <div className="w-16 h-16 rounded-2xl bg-[#111827] flex items-center justify-center mb-6 border border-gray-800 group-hover:scale-110 transition-transform shadow-inner">
                            <Icon className="text-gray-500 group-hover:text-red-500 transition-colors" size={28} />
                        </div>
                        <p className="text-[11px] text-gray-500 mb-6 px-4 leading-relaxed tracking-tight">
                            Drag and drop or click to <br /> <span className="text-gray-400 font-medium">browse file</span>
                        </p>
                        <div className="px-6 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-wide rounded-full shadow-lg group-hover:bg-gray-100 transition-colors">
                            Browse file
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function UnifiedUploadForm({ category = 'story' }) {
    const router = useRouter();
    
    // --- Unified Form State ---
    const [formData, setFormData] = useState({
        // Story fields
        title: '', ethnicGroup: '', description: '', significance: '',
        // Food fields
        name: '', dish_name: '', duration: '',
        // Music fields
        genre: '', tags: '', is_featured: false
    });
    const [mediaFiles, setMediaFiles] = useState({
        cover: null, text: null, audio: null, video: null
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [isDrafting, setIsDrafting] = useState(false);

    // Auto-save draft logic per category
    const draftKey = `sawaflix_${category}_draft`;
    useEffect(() => {
        const saved = localStorage.getItem(draftKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.formData) setFormData(parsed.formData);
            } catch (e) {
                console.error("Failed to load draft");
            }
        }
    }, [category]);

    const saveDraft = () => {
        setIsDrafting(true);
        localStorage.setItem(draftKey, JSON.stringify({ formData }));
        setTimeout(() => {
            setIsDrafting(false);
            setMessage({ type: 'success', text: 'Draft saved successfully!' });
        }, 800);
    };

    const handleInputChange = (e) => {
        const { name, type, checked, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    // --- Dynamic Submissions per Category ---
    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true); setMessage(null);
        
        try {
            const payload = new FormData();
            let endpoint = '';

            // --- 1. Story Flow ---
            if (category === 'story') {
                if (!formData.title || !formData.ethnicGroup || !formData.description || !formData.significance) {
                    setMessage({ type: 'error', text: 'Please fill in all required fields (*)' });
                    setLoading(false); return;
                }
                endpoint = '/api/content/stories/upload';
                payload.append('title', formData.title);
                payload.append('community_group', formData.ethnicGroup);
                payload.append('content_text', `DESCRIPTION:\n${formData.description}\n\nSIGNIFICANCE:\n${formData.significance}`);
                
                const contentType = mediaFiles.audio ? 'audio' : (mediaFiles.text ? 'text' : 'audio');
                payload.append('content_type', contentType);
                payload.append('languages', 'English');
                
                if (mediaFiles.cover) payload.append('cover', mediaFiles.cover);
                if (mediaFiles.audio) payload.append('media', mediaFiles.audio);
                else if (mediaFiles.text) payload.append('media', mediaFiles.text); // Document route 
            }
            
            // --- 2. Food Flow ---
            else if (category === 'food') {
                if (!formData.name || !formData.dish_name || !mediaFiles.video) {
                    setMessage({ type: 'error', text: 'Creator Name, Dish Name, and Video are required (*)' });
                    setLoading(false); return;
                }
                endpoint = '/api/content/food/upload';
                payload.append('name', formData.name);
                payload.append('dish_name', formData.dish_name);
                payload.append('description', formData.description);
                if (formData.duration) payload.append('duration', formData.duration);
                if (mediaFiles.cover) payload.append('cover', mediaFiles.cover);
                if (mediaFiles.video) payload.append('video', mediaFiles.video);
            }
            
            // --- 3. Music Flow ---
            else if (category === 'music') {
                if (!formData.title || !mediaFiles.audio) {
                    setMessage({ type: 'error', text: 'Title and Audio File are required (*)' });
                    setLoading(false); return;
                }
                endpoint = '/api/content/music/upload';
                payload.append('title', formData.title);
                payload.append('description', formData.description);
                payload.append('genre', formData.genre);
                payload.append('tags', formData.tags);
                payload.append('is_featured', formData.is_featured);
                if (mediaFiles.cover) payload.append('cover', mediaFiles.cover);
                if (mediaFiles.audio) payload.append('audio', mediaFiles.audio);
            }

            // --- Execute Upload ---
            const res = await fetch(endpoint, { method: 'POST', body: payload });
            const result = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Published successfully! Redirecting...' });
                localStorage.removeItem(draftKey);
                setTimeout(() => router.push('/Creator-dashboard/content'), 2000);
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
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

             {/* Dynamic Header Section */}
             <div className="flex items-center justify-center pt-4">
                <h1 className="text-3xl font-bold text-white tracking-tight capitalize">
                    Upload {category}
                </h1>
            </div>

            <div className="space-y-12">

                {/* --- CONFIGURABLE TEXT INPUTS --- */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold text-gray-200">Descriptions</h2>
                        <div className="h-[1px] flex-1 bg-gray-800" />
                    </div>

                    <div className="bg-[#0E1628]/40 border border-gray-800/60 rounded-3xl p-8 backdrop-blur-md">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                            
                            {/* --- STORY OR MUSIC => TITLE --- */}
                            {(category === 'story' || category === 'music') && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300 ml-1">Title*</label>
                                    <input
                                        name="title" value={formData.title} onChange={handleInputChange}
                                        placeholder="Enter your title"
                                        className="w-full bg-[#080E1C] border border-gray-800 rounded-xl py-3.5 px-5 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-gray-600"
                                    />
                                </div>
                            )}

                            {/* --- FOOD => CREATOR NAME & DISH NAME --- */}
                            {category === 'food' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-300 ml-1">Creator Name*</label>
                                        <input
                                            name="name" value={formData.name} onChange={handleInputChange}
                                            placeholder="John Doe"
                                            className="w-full bg-[#080E1C] border border-gray-800 rounded-xl py-3.5 px-5 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-300 ml-1">Dish Name*</label>
                                        <input
                                            name="dish_name" value={formData.dish_name} onChange={handleInputChange}
                                            placeholder="Ndole and Plantains"
                                            className="w-full bg-[#080E1C] border border-gray-800 rounded-xl py-3.5 px-5 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-300 ml-1">Duration (mins)</label>
                                        <input
                                            name="duration" type="number" value={formData.duration} onChange={handleInputChange}
                                            placeholder="15"
                                            className="w-full bg-[#080E1C] border border-gray-800 rounded-xl py-3.5 px-5 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-gray-600"
                                        />
                                    </div>
                                </>
                            )}

                            {/* --- STORY => ETHNIC GROUP --- */}
                            {category === 'story' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300 ml-1">Ethnic Group*</label>
                                    <div className="relative group">
                                        <select
                                            name="ethnicGroup" value={formData.ethnicGroup} onChange={handleInputChange}
                                            className="w-full bg-[#080E1C] border border-gray-800 rounded-xl py-3.5 px-5 text-sm text-white focus:border-red-500/50 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-[#0F172A]">Choose your ethnic group</option>
                                            <option value="Sawa" className="bg-[#0F172A]">Sawa (Coastals)</option>
                                            <option value="Grassfields" className="bg-[#0F172A]">Grassfields</option>
                                            <option value="Fang-Beti" className="bg-[#0F172A]">Fang-Beti</option>
                                            <option value="Sudano-Sahelian" className="bg-[#0F172A]">Sudano-Sahelian</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                             {/* --- MUSIC => GENRE & TAGS --- */}
                             {category === 'music' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-300 ml-1">Genres (comma separated)</label>
                                        <input
                                            name="genre" value={formData.genre} onChange={handleInputChange}
                                            placeholder="Hip-Hop, Makossa, Afrobeats"
                                            className="w-full bg-[#080E1C] border border-gray-800 rounded-xl py-3.5 px-5 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-300 ml-1">Tags (comma separated)</label>
                                        <input
                                            name="tags" value={formData.tags} onChange={handleInputChange}
                                            placeholder="chill, party, summer"
                                            className="w-full bg-[#080E1C] border border-gray-800 rounded-xl py-3.5 px-5 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-gray-600"
                                        />
                                    </div>
                                    <div className="col-span-1 lg:col-span-2 flex items-center gap-3 bg-[#080E1C] border border-gray-800 rounded-xl p-4">
                                        <input 
                                            name="is_featured" type="checkbox" checked={formData.is_featured} onChange={handleInputChange}
                                            className="w-5 h-5 accent-red-500"
                                        />
                                        <label className="text-sm font-bold text-gray-300">Mark as Featured Artist/Track</label>
                                    </div>
                                </>
                            )}

                            {/* --- ALL => SHARED DESCRIPTION FIELDS --- */}
                            <div className={`space-y-2 ${category === 'story' ? '' : 'lg:col-span-2'}`}>
                                <label className="text-sm font-bold text-gray-300 ml-1">Description {category === 'story' ? '*' : '(Optional)'}</label>
                                <textarea
                                    name="description" value={formData.description} onChange={handleInputChange} rows={4}
                                    placeholder="Enter the description"
                                    className="w-full bg-[#080E1C] border border-gray-800 rounded-xl py-3.5 px-5 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-gray-600 resize-none leading-relaxed"
                                />
                            </div>

                            {/* --- STORY => EXTRA SIGNIFICANCE FIELD --- */}
                            {category === 'story' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300 ml-1">Significance*</label>
                                    <textarea
                                        name="significance" value={formData.significance} onChange={handleInputChange} rows={4}
                                        placeholder="Enter the significance"
                                        className="w-full bg-[#080E1C] border border-gray-800 rounded-xl py-3.5 px-5 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-gray-600 resize-none leading-relaxed"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>


                {/* --- CONFIGURABLE MEDIA DROPZONES --- */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold text-gray-200">Properties</h2>
                        <div className="h-[1px] flex-1 bg-gray-800" />
                    </div>

                    <div className="bg-[#0E1628]/40 border border-gray-800/60 rounded-3xl p-8 backdrop-blur-md">
                        <div className="flex gap-8 justify-between">
                            
                            {/* Every category has a Cover Image */}
                            <div className="flex-1">
                                <FileUploadZone
                                    title="Cover Image" icon={ImageIcon}
                                    accept={{ "image/*": [".jpeg", ".png", ".jpg", ".webp"] }}
                                    file={mediaFiles.cover}
                                    onFileSelect={(f) => setMediaFiles(prev => ({ ...prev, cover: f }))}
                                    onRemove={() => setMediaFiles(prev => ({ ...prev, cover: null }))}
                                />
                            </div>

                            {/* Story logic */}
                            {category === 'story' && (
                                <>
                                    <div className="flex-1">
                                        <FileUploadZone
                                            title="Text Record (PDF/TXT)" icon={FileText}
                                            accept={{ "application/pdf": [".pdf"], "text/plain": [".txt"] }}
                                            file={mediaFiles.text}
                                            onFileSelect={(f) => setMediaFiles(prev => ({ ...prev, text: f }))}
                                            onRemove={() => setMediaFiles(prev => ({ ...prev, text: null }))}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <FileUploadZone
                                            title="Audio Recording" icon={Music}
                                            accept={{ "audio/*": [".mp3", ".wav", ".m4a"] }}
                                            file={mediaFiles.audio}
                                            onFileSelect={(f) => setMediaFiles(prev => ({ ...prev, audio: f }))}
                                            onRemove={() => setMediaFiles(prev => ({ ...prev, audio: null }))}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Food logic */}
                            {category === 'food' && (
                                <div className="flex-1 w-full max-w-sm">
                                    <FileUploadZone
                                        title="Recipe Video" icon={Video}
                                        accept={{ "video/*": [".mp4", ".mov", ".mkv"] }}
                                        file={mediaFiles.video}
                                        onFileSelect={(f) => setMediaFiles(prev => ({ ...prev, video: f }))}
                                        onRemove={() => setMediaFiles(prev => ({ ...prev, video: null }))}
                                    />
                                </div>
                            )}

                            {/* Music logic */}
                            {category === 'music' && (
                                <div className="flex-1 w-full max-w-sm">
                                    <FileUploadZone
                                        title="Audio Track" icon={Music}
                                        accept={{ "audio/*": [".mp3", ".wav", ".m4a"] }}
                                        file={mediaFiles.audio}
                                        onFileSelect={(f) => setMediaFiles(prev => ({ ...prev, audio: f }))}
                                        onRemove={() => setMediaFiles(prev => ({ ...prev, audio: null }))}
                                    />
                                </div>
                            )}

                        </div>
                    </div>
                </section>

                {/* --- ACTION BUTTONS --- */}
                <div className="flex items-center gap-4 pt-6">
                    <button
                        onClick={saveDraft} disabled={loading || isDrafting}
                        className="flex-1 max-w-[200px] h-12 bg-white hover:bg-gray-100 text-black font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                    >
                        {isDrafting ? <Loader2 className="animate-spin" size={18} /> : "Save As Draft"}
                    </button>
                    <button
                        onClick={handleUpload} disabled={loading}
                        className="flex-1 max-w-[200px] h-12 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-500/20"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Upload"}
                    </button>
                </div>

            </div>

            {/* --- ERROR/SUCCESS NOTIFICATIONS --- */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`fixed bottom-10 right-10 z-[100] p-6 rounded-2xl border flex items-center gap-4 shadow-2xl backdrop-blur-xl ${message.type === 'success'
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${message.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <p className="text-sm font-medium">{message.text}</p>
                        <button onClick={() => setMessage(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors ml-4">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

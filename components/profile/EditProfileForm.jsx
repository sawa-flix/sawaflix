'use client';

import React, { useState, useEffect } from 'react';
import { 
    Camera, User, Link as LinkIcon, 
    AlertCircle, Globe, X, Plus, 
    Image as ImageIcon, Sparkles, CheckCircle2,
    Info, Layout, Settings, UploadCloud, Trash2,
    MapPin, Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CAMEROON_REGIONS, NW_CAMEROON_TRIBES, MUSIC_GENRES, LANGUAGE_PREFERENCES } from '@/lib/cameroon-data';

const EditProfileForm = ({ initialData, onSave, isSaving }) => {
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        profileImage: '',
        bannerImage: '',
        socialLinks: [],
        region: '',
        ethnicGroup: '',
        village: '',
        languagePreference: '',
        locationRegion: '',
        favoredGenres: [],
        otherTribe: ''
    });
    const [previews, setPreviews] = useState({ profile: '', banner: '' });
    const [uploading, setUploading] = useState({ profile: false, banner: false });
    const [socialInput, setSocialInput] = useState({ platform: '', url: '' });
    const [uploadError, setUploadError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                displayName: initialData.displayName || '',
                bio: initialData.bio || '',
                profileImage: initialData.profileImage || '',
                bannerImage: initialData.bannerImage || '',
                socialLinks: initialData.socialLinks || [],
                region: initialData.region || '',
                ethnicGroup: initialData.ethnicGroup || '',
                village: initialData.village || '',
                languagePreference: initialData.languagePreference || '',
                locationRegion: initialData.locationRegion || '',
                favoredGenres: initialData.favoredGenres || [],
                otherTribe: initialData.ethnicGroup === 'other' ? (initialData.village || '') : ''
            });
            setPreviews({
                profile: initialData.profileImage || '',
                banner: initialData.bannerImage || ''
            });
        }
    }, [initialData]);

    /**
     * Handles asset uploads directly to Supabase storage via API endpoint
     */
    const handleAssetUpload = async (type, file) => {
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'heic' || ext === 'heif') {
            setUploadError('HEIC/HEIF files cannot be displayed in browsers. Please convert to JPG or PNG before uploading.');
            return;
        }
        
        console.log('handleAssetUpload called:', {
            type,
            fileName: file.name,
            fileSize: file.size,
            fileMimeType: file.type,
            fileLastModified: file.lastModified
        });
        
        // Show local preview while uploading
        const reader = new FileReader();
        reader.onload = (event) => {
            setPreviews(prev => ({ ...prev, [type]: event.target.result }));
        };
        reader.readAsDataURL(file);
        
        setUploading(prev => ({ ...prev, [type]: true }));
        setUploadError('');

        try {
            const category = type === 'profile' ? 'profile_image' : 'cover_image';
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('category', category);

            console.log('Sending upload request:', {
                category,
                fileName: file.name,
                endpoint: '/api/creator/upload'
            });

            const res = await fetch('/api/creator/upload', {
                method: 'POST',
                body: uploadFormData
            });

            console.log('Upload response status:', res.status);

            if (!res.ok) {
                const errorData = await res.json();
                console.error('Upload error response:', errorData);
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await res.json();
            console.log('Upload success:', data);
            
            if (data.url) {
                setFormData(prev => ({ 
                    ...prev, 
                    [type === 'profile' ? 'profileImage' : 'bannerImage']: data.url 
                }));
            }
        } catch (err) {
            console.error('Upload Error:', err);
            setUploadError(err instanceof Error ? err.message : 'Failed to upload image');
            // Clear preview on error
            setPreviews(prev => ({ ...prev, [type]: formData[type === 'profile' ? 'profileImage' : 'bannerImage'] }));
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const addSocialLink = () => {
        if (!socialInput.platform || !socialInput.url) return;
        setFormData(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, { ...socialInput }]
        }));
        setSocialInput({ platform: '', url: '' });
    };

    const removeSocialLink = (index) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.filter((_, i) => i !== index)
        }));
    };

    const toggleGenre = (genreValue) => {
        setFormData(prev => ({
            ...prev,
            favoredGenres: prev.favoredGenres.includes(genreValue)
                ? prev.favoredGenres.filter(g => g !== genreValue)
                : [...prev.favoredGenres, genreValue]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // If ethnicGroup is "other", use otherTribe as village
        const submitData = {
            ...formData,
            village: formData.ethnicGroup === 'other' ? formData.otherTribe : formData.village,
            ethnicGroup: formData.ethnicGroup === 'other' ? 'other' : formData.ethnicGroup
        };
        
        delete submitData.otherTribe;
        onSave(submitData);
    };

    return (
        <div className="max-w-5xl mx-auto font-sans text-white selection:bg-red-600/30 pb-40">
            <form onSubmit={handleSubmit} className="space-y-12">
                
                {/* Branding & Assets Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                            <Layout className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Channel Branding</h2>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Manage your visual identity across SawaFlix</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Banner Upload Card */}
                        <div className="lg:col-span-8 bg-[#0B0E14] border border-white/5 rounded-[2.5rem] overflow-hidden group shadow-2xl relative">
                            <div className="relative h-64 bg-zinc-900 overflow-hidden">
                                {previews.banner ? (
                                    <img src={previews.banner} alt="Banner Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-black text-zinc-700">
                                        <ImageIcon size={48} className="mb-4 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Banner Set</p>
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                                    <label className="cursor-pointer flex flex-col items-center gap-3">
                                        <div className="p-4 bg-white/10 rounded-full border border-white/20 hover:bg-white/20 transition-all shadow-2xl">
                                            <UploadCloud size={28} className="text-white" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Change Banner</span>
                                        <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleAssetUpload('banner', e.target.files[0])} />
                                    </label>
                                </div>

                                {uploading.banner && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40 backdrop-blur-md">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ x: '-100%' }}
                                                    animate={{ x: '100%' }}
                                                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                                    className="w-1/2 h-full bg-red-600" 
                                                />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Optimizing Image...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-8 border-t border-white/5 bg-zinc-900/50">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold">Banner Image</p>
                                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Recommended: 2048 x 1152 pixels</p>
                                    </div>
                                    <button type="button" className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-500 transition-colors">Reset</button>
                                </div>
                            </div>
                        </div>

                        {/* Profile Image Card */}
                        <div className="lg:col-span-4 bg-[#0B0E14] border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-6 group shadow-2xl">
                            <div className="relative">
                                <div className="w-40 h-40 rounded-[2.5rem] bg-zinc-900 overflow-hidden border-4 border-white/5 group-hover:border-white/20 transition-all duration-500 shadow-2xl relative">
                                    {previews.profile ? (
                                        <img src={previews.profile} alt="Profile Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                            <User size={48} className="opacity-20" />
                                        </div>
                                    )}
                                    
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm cursor-pointer">
                                        <label className="cursor-pointer flex flex-col items-center gap-2">
                                            <Camera size={24} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Change</span>
                                            <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleAssetUpload('profile', e.target.files[0])} />
                                        </label>
                                    </div>
                                </div>
                                {uploading.profile && (
                                    <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent animate-spin rounded-full" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold">Profile Picture</p>
                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest leading-relaxed">Minimum: 400 x 400 pixels</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Basic Info Section */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
                    {/* Primary Details */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="flex items-center gap-3 px-2">
                            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                <Settings className="w-4 h-4 text-zinc-400" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Basic Info</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Display Name</label>
                                <div className="relative">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                    <input 
                                        type="text" 
                                        value={formData.displayName}
                                        onChange={(e) => setFormData(p => ({ ...p, displayName: e.target.value }))}
                                        className="w-full bg-[#0B0E14] border border-white/5 rounded-[1.5rem] pl-14 pr-6 py-5 text-sm font-bold text-white focus:border-red-600/40 transition-all outline-none shadow-inner"
                                        placeholder="Channel Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Bio / Description</label>
                                    <span className="text-[9px] font-bold text-zinc-600">{formData.bio.length} / 1000</span>
                                </div>
                                <div className="relative">
                                    <Info className="absolute left-6 top-6 w-4 h-4 text-zinc-600" />
                                    <textarea 
                                        value={formData.bio}
                                        onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                                        rows={8}
                                        className="w-full bg-[#0B0E14] border border-white/5 rounded-[2rem] pl-14 pr-6 py-6 text-sm font-medium text-zinc-300 focus:border-red-600/40 transition-all outline-none resize-none leading-relaxed shadow-inner"
                                        placeholder="Tell your viewers about your channel..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Hub Section */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="flex items-center gap-3 px-2">
                            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                <Globe className="w-4 h-4 text-zinc-400" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Social Hub</h2>
                        </div>

                        <div className="bg-[#0B0E14] border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <select 
                                        value={socialInput.platform}
                                        onChange={(e) => setSocialInput(p => ({ ...p, platform: e.target.value }))}
                                        className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-red-600/40"
                                    >
                                        <option value="">Platform</option>
                                        <option value="youtube">YouTube</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="twitter">Twitter / X</option>
                                        <option value="globe">Website</option>
                                    </select>
                                    <button 
                                        type="button" 
                                        onClick={addSocialLink}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl transition-all shadow-lg active:scale-95"
                                    >
                                        <Plus size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Add Link</span>
                                    </button>
                                </div>
                                <input 
                                    type="text" 
                                    value={socialInput.url}
                                    onChange={(e) => setSocialInput(p => ({ ...p, url: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-6 py-4 text-xs font-bold text-white focus:border-red-600/40 transition-all outline-none"
                                    placeholder="Paste URL here..."
                                />
                            </div>

                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {formData.socialLinks.map((link, i) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.9, opacity: 0 }}
                                            className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-2xl group hover:border-red-600/20 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-black/40 rounded-lg">
                                                    <LinkIcon size={12} className="text-zinc-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{link.platform}</span>
                                                    <span className="text-[11px] font-bold text-zinc-300 truncate max-w-[150px]">{link.url}</span>
                                                </div>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => removeSocialLink(i)} 
                                                className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {formData.socialLinks.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-10 text-center opacity-20">
                                        <Globe size={32} className="mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Social Links Connected</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Regional & Cultural Information */}
                <section className="space-y-6 pt-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                            <MapPin className="w-4 h-4 text-zinc-400" />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Regional & Cultural Info</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Region</label>
                            <select 
                                value={formData.region}
                                onChange={(e) => setFormData(p => ({ ...p, region: e.target.value }))}
                                className="w-full bg-[#0B0E14] border border-white/5 rounded-[1.5rem] px-6 py-4 text-sm font-bold text-white focus:border-red-600/40 transition-all outline-none"
                            >
                                <option value="">Select Region</option>
                                {CAMEROON_REGIONS.map(region => (
                                    <option key={region.value} value={region.value}>{region.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Location Region</label>
                            <select 
                                value={formData.locationRegion}
                                onChange={(e) => setFormData(p => ({ ...p, locationRegion: e.target.value }))}
                                className="w-full bg-[#0B0E14] border border-white/5 rounded-[1.5rem] px-6 py-4 text-sm font-bold text-white focus:border-red-600/40 transition-all outline-none"
                            >
                                <option value="">Select Location Region</option>
                                {CAMEROON_REGIONS.map(region => (
                                    <option key={region.value} value={region.value}>{region.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Ethnic Group / Tribe</label>
                            <select 
                                value={formData.ethnicGroup}
                                onChange={(e) => setFormData(p => ({ ...p, ethnicGroup: e.target.value }))}
                                className="w-full bg-[#0B0E14] border border-white/5 rounded-[1.5rem] px-6 py-4 text-sm font-bold text-white focus:border-red-600/40 transition-all outline-none"
                            >
                                <option value="">Select Ethnic Group</option>
                                {NW_CAMEROON_TRIBES.map(tribe => (
                                    <option key={tribe.value} value={tribe.value}>{tribe.label}</option>
                                ))}
                            </select>
                        </div>

                        {formData.ethnicGroup === 'other' && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Please Specify Your Tribe</label>
                                <input 
                                    type="text" 
                                    value={formData.otherTribe}
                                    onChange={(e) => setFormData(p => ({ ...p, otherTribe: e.target.value }))}
                                    className="w-full bg-[#0B0E14] border border-white/5 rounded-[1.5rem] px-6 py-4 text-sm font-bold text-white focus:border-red-600/40 transition-all outline-none"
                                    placeholder="Enter your tribe name"
                                />
                            </div>
                        )}

                        {formData.ethnicGroup !== 'other' && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Village / Town</label>
                                <input 
                                    type="text" 
                                    value={formData.village}
                                    onChange={(e) => setFormData(p => ({ ...p, village: e.target.value }))}
                                    className="w-full bg-[#0B0E14] border border-white/5 rounded-[1.5rem] px-6 py-4 text-sm font-bold text-white focus:border-red-600/40 transition-all outline-none"
                                    placeholder="Your village or town"
                                />
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Language Preference</label>
                            <select 
                                value={formData.languagePreference}
                                onChange={(e) => setFormData(p => ({ ...p, languagePreference: e.target.value }))}
                                className="w-full bg-[#0B0E14] border border-white/5 rounded-[1.5rem] px-6 py-4 text-sm font-bold text-white focus:border-red-600/40 transition-all outline-none"
                            >
                                <option value="">Select Language</option>
                                {LANGUAGE_PREFERENCES.map(lang => (
                                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Music Preferences */}
                <section className="space-y-6 pt-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                            <Music className="w-4 h-4 text-zinc-400" />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Music Preferences</h2>
                    </div>

                    <div className="bg-[#0B0E14] border border-white/5 rounded-[2.5rem] p-8">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Select genres you enjoy</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {MUSIC_GENRES.map(genre => (
                                <button
                                    key={genre.value}
                                    type="button"
                                    onClick={() => toggleGenre(genre.value)}
                                    className={`px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                                        formData.favoredGenres.includes(genre.value)
                                            ? 'bg-red-600 text-white border border-red-600'
                                            : 'bg-zinc-900/50 text-zinc-300 border border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    {genre.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Error Alert */}
                {uploadError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto w-[90%]"
                    >
                        <div className="p-4 bg-red-600/20 border border-red-600/50 rounded-[1.5rem] flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-red-100">{uploadError}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setUploadError('')}
                                className="text-red-600 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Floating Bottom Control Bar */}
                <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-2xl"
                >
                    <div className="p-4 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
                        <div className="hidden sm:flex items-center gap-3 pl-6">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Review Changes</span>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button 
                                type="button"
                                onClick={() => window.location.reload()}
                                className="px-8 py-3.5 bg-zinc-800 rounded-full font-black text-[10px] text-white uppercase tracking-widest hover:bg-zinc-700 transition-all active:scale-95 border border-white/5"
                            >
                                Revert
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSaving || uploading.profile || uploading.banner}
                                className="flex-1 sm:flex-none px-12 py-3.5 bg-red-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-500 transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {isSaving ? (
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                ) : (
                                    <CheckCircle2 size={16} />
                                )}
                                <span>Publish Changes</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </form>
        </div>
    );
};

export default EditProfileForm;

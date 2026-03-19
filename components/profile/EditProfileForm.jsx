import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Save, Plus, X, Globe, Twitter, Instagram, Youtube, ExternalLink, BadgeCheck, Clock, AlertCircle, Sparkles, FileText } from 'lucide-react';
import { uploadFile } from '../../lib/verification';
import Link from 'next/link';

const EditProfileForm = ({ initialData, onSave, isSaving, verificationStatus }) => {
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        category: '',
        profileImage: '',
        bannerImage: '',
        socialLinks: []
    });

    const [uploading, setUploading] = useState({ profile: false, banner: false });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                socialLinks: initialData.socialLinks || []
            }));
        }
    }, [initialData]);

    const handleAssetUpload = async (type, file) => {
        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            const { url } = await uploadFile(file, type === 'profile' ? 'selfie' : 'national_id');
            setFormData(prev => ({ ...prev, [type === 'profile' ? 'profileImage' : 'bannerImage']: url }));
        } catch (error) {
            console.error(`${type} upload failed`, error);
            alert(`Failed to upload ${type} image`);
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const addSocialLink = () => {
        setFormData(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, { platform: 'globe', url: '' }]
        }));
    };

    const updateSocialLink = (index, field, value) => {
        const newLinks = [...formData.socialLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setFormData(prev => ({ ...prev, socialLinks: newLinks }));
    };

    const removeSocialLink = (index) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="space-y-12 pb-32">
            {/* Creator Status Banner */}
            {verificationStatus === 'none' && (
                <div className="bg-linear-to-r from-red-600/20 to-purple-600/20 border border-red-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-red-600/10 rounded-full blur-3xl group-hover:bg-red-600/20 transition-all duration-700" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-600/40 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Become a <span className="text-red-500">Verified Creator</span></h3>
                            <p className="text-gray-400 text-sm font-medium mt-1">Unlock monetization, analytics, and featured placements.</p>
                        </div>
                    </div>
                    <Link 
                        href="/creator/verify"
                        className="relative z-10 px-8 py-3 bg-red-600 text-white rounded-full font-black text-sm hover:bg-red-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-600/20 uppercase tracking-widest whitespace-nowrap"
                    >
                        Get Started
                    </Link>
                </div>
            )}

            {verificationStatus === 'pending' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Application <span className="text-yellow-500">Pending</span></h3>
                            <p className="text-gray-400 text-xs font-medium">Our team is reviewing your creator application.</p>
                        </div>
                    </div>
                    <Link href="/dashboard" className="text-yellow-500 hover:text-yellow-400 text-xs font-black uppercase tracking-widest">Check Status</Link>
                </div>
            )}

            {verificationStatus === 'approved' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <BadgeCheck className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Verified <span className="text-green-500">Creator</span></h3>
                            <p className="text-gray-400 text-xs font-medium">You have full access to creator features.</p>
                        </div>
                    </div>
                    <Link href="/dashboard" className="text-green-500 hover:text-green-400 text-xs font-black uppercase tracking-widest">Go to Dashboard</Link>
                </div>
            )}

            {verificationStatus === 'rejected' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Application <span className="text-red-500">Rejected</span></h3>
                            <p className="text-gray-400 text-xs font-medium">Please review feedback and try again.</p>
                        </div>
                    </div>
                    <Link href="/creator/verify" className="text-red-500 hover:text-red-400 text-xs font-black uppercase tracking-widest">Re-apply</Link>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* Banner Upload */}
                <div className="relative group">
                    <div className="relative h-56 md:h-80 rounded-4xl overflow-hidden bg-gray-900/50 border-2 border-dashed border-gray-800 transition-all hover:border-red-500/30">
                        {formData.bannerImage ? (
                            <img src={formData.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                                <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                                <span className="text-xs font-black uppercase tracking-[0.2em]">Upload Cover Story Image</span>
                            </div>
                        )}
                        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => e.target.files[0] && handleAssetUpload('banner', e.target.files[0])}
                            />
                            <div className="bg-white text-black px-6 py-3 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-3 font-black text-xs uppercase tracking-widest">
                                {uploading.banner ? (
                                    <Clock className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Camera className="w-4 h-4" />
                                )}
                                {uploading.banner ? 'Uploading...' : 'Change Cover'}
                            </div>
                        </label>
                    </div>

                    {/* Profile Image - Floats on banner */}
                    <div className="absolute -bottom-16 left-12 group/avatar">
                        <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] border-[#0B0E14] bg-[#141820] overflow-hidden shadow-2xl relative">
                            {formData.profileImage ? (
                                <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-700">
                                    <Camera className="w-12 h-12" />
                                </div>
                            )}
                            <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/60 opacity-0 group/avatar hover:opacity-100 transition-all duration-300">
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => e.target.files[0] && handleAssetUpload('profile', e.target.files[0])}
                                />
                                {uploading.profile ? (
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                                ) : (
                                    <Camera className="w-8 h-8 text-white" />
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                <div className="pt-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Basic Info */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#141820]/50 border border-gray-800 rounded-3xl p-6 space-y-6">
                            <div>
                                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Display Name</label>
                                <input 
                                    type="text"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData(p => ({ ...p, displayName: e.target.value }))}
                                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-2xl px-4 py-4 text-white focus:border-red-500 outline-none transition-colors font-bold shadow-inner"
                                    placeholder="Jason Miller"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Primary Craft</label>
                                <select 
                                    value={formData.category}
                                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-2xl px-4 py-4 text-white focus:border-red-500 outline-none transition-colors font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">User / Viewer</option>
                                    <option value="musician">Musician</option>
                                    <option value="filmmaker">Filmmaker</option>
                                    <option value="visual-artist">Visual Artist</option>
                                    <option value="storyteller">Storyteller</option>
                                </select>
                            </div>
                        </div>

                        {/* Save Action for Desktop */}
                        <div className="hidden lg:block pt-4">
                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-3 py-5 bg-white text-black rounded-3xl font-black text-sm hover:bg-gray-100 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/5 disabled:opacity-50 ring-1 ring-white/10 uppercase tracking-[0.2em]"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-black/20 border-t-black animate-spin rounded-full" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {isSaving ? 'Processing' : 'Commit Changes'}
                            </button>
                        </div>
                    </div>

                    {/* Bio & Socials */}
                    <div className="lg:col-span-8 space-y-8">
                        <div>
                            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FileText size={12} /> The Story of You (Bio)
                            </label>
                            <textarea 
                                value={formData.bio}
                                onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                                rows={8}
                                className="w-full bg-[#141820]/30 border border-gray-800 rounded-4xl px-6 py-6 text-white focus:border-red-500 outline-none transition-all resize-none font-medium leading-[1.8] shadow-inner"
                                placeholder="Share your journey, your culture, and what drives your passion..."
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <Globe size={12} /> Digital Presence
                                </label>
                                <button 
                                    type="button"
                                    onClick={addSocialLink}
                                    className="p-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-full transition-all group"
                                    title="Add Social Link"
                                >
                                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formData.socialLinks.map((link, idx) => {
                                    const Icon = platformIcons[link.platform] || Globe;
                                    return (
                                        <div key={idx} className="flex items-center gap-2 bg-[#141820]/50 border border-gray-800 rounded-2xl p-3 group animate-in zoom-in duration-300">
                                            <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-red-500 transition-colors">
                                                <Icon size={18} />
                                            </div>
                                            <select 
                                                value={link.platform}
                                                onChange={(e) => updateSocialLink(idx, 'platform', e.target.value)}
                                                className="bg-transparent border-none text-gray-400 outline-none cursor-pointer text-xs font-bold uppercase tracking-widest w-24"
                                            >
                                                <option value="globe">Other</option>
                                                <option value="instagram">Instagram</option>
                                                <option value="twitter">Twitter</option>
                                                <option value="youtube">YouTube</option>
                                            </select>
                                            <input 
                                                type="text"
                                                value={link.url}
                                                onChange={(e) => updateSocialLink(idx, 'url', e.target.value)}
                                                className="flex-1 bg-transparent border-none outline-none text-white text-sm font-medium"
                                                placeholder="Link value..."
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => removeSocialLink(idx)}
                                                className="p-2 hover:bg-red-500/10 text-gray-600 hover:text-red-500 rounded-xl transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                                {formData.socialLinks.length === 0 && (
                                    <div className="md:col-span-2 py-8 text-center bg-[#141820]/20 border border-dashed border-gray-800 rounded-4xl">
                                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">No social links added yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Save Button */}
                        <div className="lg:hidden pt-8">
                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-3 py-5 bg-white text-black rounded-3xl font-black text-sm active:scale-95 transition-all shadow-2xl"
                            >
                                {isSaving ? <Clock className="animate-spin" /> : <Save />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

const platformIcons = {
    globe: Globe,
    twitter: Twitter,
    instagram: Instagram,
    youtube: Youtube
};

export default EditProfileForm;

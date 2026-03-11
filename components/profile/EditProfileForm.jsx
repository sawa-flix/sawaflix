import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Save, Plus, X, Globe, Twitter, Instagram, Youtube, ExternalLink } from 'lucide-react';
import { uploadFile } from '../../lib/verification';

const EditProfileForm = ({ initialData, onSave, isSaving }) => {
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        category: '',
        profileImage: '',
        bannerImage: '',
        socialLinks: [] // [{ platform: 'instagram', url: '' }]
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
            const { url } = await uploadFile(file, type === 'profile' ? 'selfie' : 'national_id'); // Reusing existing categories
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

    const platformIcons = {
        globe: Globe,
        twitter: Twitter,
        instagram: Instagram,
        youtube: Youtube
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Banner Upload */}
            <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-gray-800 border-2 border-dashed border-gray-700 group">
                {formData.bannerImage ? (
                    <img src={formData.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                        <Image unoptimizedIcon className="w-10 h-10 mb-2" />
                        <span className="text-sm font-bold uppercase tracking-widest">Upload Banner Image</span>
                    </div>
                )}
                <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => e.target.files[0] && handleAssetUpload('banner', e.target.files[0])}
                    />
                    <div className="bg-white text-black p-3 rounded-full shadow-xl hover:scale-110 transition-transform">
                        {uploading.banner ? (
                            <div className="w-6 h-6 border-2 border-black/20 border-t-black animate-spin rounded-full" />
                        ) : (
                            <Camera className="w-6 h-6" />
                        )}
                    </div>
                </label>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 px-2">
                {/* Profile Image & Left Info */}
                <div className="lg:w-1/3 flex flex-col items-center text-center">
                    <div className="relative -mt-20 sm:-mt-24 mb-6">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#0B0E14] bg-gray-800 overflow-hidden shadow-2xl relative group">
                            {formData.profileImage ? (
                                <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400">
                                    <Camera className="w-10 h-10" />
                                </div>
                            )}
                            <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => e.target.files[0] && handleAssetUpload('profile', e.target.files[0])}
                                />
                                {uploading.profile ? (
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                                ) : (
                                    <Camera className="w-6 h-6 text-white" />
                                )}
                            </label>
                        </div>
                    </div>
                    
                    <div className="w-full space-y-4">
                        <div>
                            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Display Name</label>
                            <input 
                                type="text"
                                value={formData.displayName}
                                onChange={(e) => setFormData(p => ({ ...p, displayName: e.target.value }))}
                                className="w-full bg-[#141820] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-colors text-center font-bold"
                                placeholder="e.g. Jason Miller"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Creator Category</label>
                            <select 
                                value={formData.category}
                                onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                                className="w-full bg-[#141820] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-colors text-center font-bold appearance-none cursor-pointer"
                            >
                                <option value="">Select Category</option>
                                <option value="musician">Musician</option>
                                <option value="filmmaker">Filmmaker</option>
                                <option value="visual-artist">Visual Artist</option>
                                <option value="storyteller">Storyteller</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Form Fields */}
                <div className="flex-1 space-y-8">
                    <div>
                        <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">Bio / Cultural Story</label>
                        <textarea 
                            value={formData.bio}
                            onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                            rows={6}
                            className="w-full bg-[#141820] border border-gray-800 rounded-2xl px-5 py-4 text-white focus:border-red-500 outline-none transition-colors resize-none font-medium leading-relaxed"
                            placeholder="Tell the world about your heritage and craft..."
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Social Links</label>
                            <button 
                                type="button"
                                onClick={addSocialLink}
                                className="text-red-500 hover:text-red-400 text-xs font-bold flex items-center gap-1 uppercase tracking-widest"
                            >
                                <Plus className="w-3 h-3" /> Add Link
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.socialLinks.map((link, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-[#141820] border border-gray-800 rounded-xl p-2 animate-in zoom-in duration-300">
                                    <select 
                                        value={link.platform}
                                        onChange={(e) => updateSocialLink(idx, 'platform', e.target.value)}
                                        className="bg-black/40 border border-gray-700 rounded-lg p-2 text-white outline-none cursor-pointer text-xs"
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
                                        className="flex-1 bg-transparent border-none outline-none text-white text-sm px-2"
                                        placeholder="https://..."
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => removeSocialLink(idx)}
                                        className="p-1 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 flex justify-end">
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-3 px-10 py-4 bg-white text-red-600 rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50 disabled:scale-100"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-red-600/20 border-t-red-600 animate-spin rounded-full" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default EditProfileForm;

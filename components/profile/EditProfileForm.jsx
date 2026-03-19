import React, { useState, useEffect } from 'react';
import { Camera, User, Link as LinkIcon, BadgeCheck, AlertCircle, Save, Globe, X, Plus, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '../../lib/verification';
import Link from 'next/link';

const EditProfileForm = ({ initialData, onSave, isSaving, verificationStatus, rejectionFeedback }) => {
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        profileImage: '',
        bannerImage: '',
        socialLinks: []
    });
    const [previews, setPreviews] = useState({ profile: '', banner: '' });
    const [uploading, setUploading] = useState({ profile: false, banner: false });
    const [socialInput, setSocialInput] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                displayName: initialData.displayName || '',
                bio: initialData.bio || '',
                profileImage: initialData.profileImage || '',
                bannerImage: initialData.bannerImage || '',
                socialLinks: initialData.socialLinks || []
            });
            // Update previews with server data if not currently uploading a local file
            setPreviews(prev => ({
                profile: uploading.profile ? prev.profile : (initialData.profileImage || ''),
                banner: uploading.banner ? prev.banner : (initialData.bannerImage || '')
            }));
        }
    }, [initialData, uploading.profile, uploading.banner]);

    const handleAssetUpload = async (type, file) => {
        if (!file) return;
        
        // Final robustness for previews: use DataURL to ensure they load regardless of blob logic
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            setPreviews(prev => ({ ...prev, [type]: dataUrl }));
        };
        reader.readAsDataURL(file);
        
        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            const res = await uploadFile(file, 'id');
            if (res && res.url) {
                setFormData(prev => ({ 
                    ...prev, 
                    [type === 'profile' ? 'profileImage' : 'bannerImage']: res.url 
                }));
            }
        } catch (err) {
            console.error('Upload Error:', err);
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const addSocialLink = () => {
        if (!socialInput) return;
        setFormData(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, socialInput]
        }));
        setSocialInput('');
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
        <div className="max-w-4xl mx-auto font-sans text-white antialiased">
            <style jsx>{`
                .img-overlay {
                    background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
                }
                .grid-pattern {
                    background-image: radial-gradient(#ffffff 1px, transparent 1px);
                    background-size: 20px 20px;
                }
                .line-pattern {
                    background-image: linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px);
                    background-size: 10px 10px;
                }
                /* Ensure images never show a white box if broken */
                img {
                    background: transparent;
                    color: transparent;
                }
            `}</style>

            {/* Status Monitoring Bar */}
            {verificationStatus !== 'none' && (
                <div className="mb-8 p-5 bg-[#0f172a] border border-white/5 rounded-2xl flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                            verificationStatus === 'approved' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' :
                            verificationStatus === 'pending' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'
                        }`} />
                        <span className="text-xs font-black uppercase tracking-widest">
                            Account Profile: <span className="opacity-60">{verificationStatus}</span>
                        </span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Visual Identity Section */}
                <div className="bg-[#0f172a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl group relative">
                    
                    {/* Banner Canvas */}
                    <div className="relative h-56 sm:h-64 bg-[#0a0c10] overflow-hidden">
                        <div className="absolute inset-0 opacity-10 grid-pattern pointer-events-none" />
                        
                        {previews.banner && (
                            <img 
                                key={`banner-${previews.banner.length}`}
                                src={previews.banner} 
                                alt=""
                                className="w-full h-full object-cover relative z-10 transition-all duration-700 blur-[0.2px]"
                                onLoad={(e) => { e.target.classList.remove('opacity-0'); }}
                            />
                        )}

                        <div className="absolute inset-0 img-overlay z-20 pointer-events-none" />

                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-30 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                            <Camera size={28} className="text-white mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Swap Banner Art</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleAssetUpload('banner', e.target.files[0])} />
                        </label>

                        {uploading.banner && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-40 h-1 bg-red-600/10 rounded-full overflow-hidden">
                                        <div className="w-1/2 h-full bg-red-600 animate-[scroll-x_1.5s_infinite_ease-in-out]" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Encoding Banner Material</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Overlay Context */}
                    <div className="px-6 sm:px-14 pb-12 relative">
                        {/* Avatar Hub */}
                        <div className="relative -mt-24 sm:-mt-32 inline-block mb-6">
                            <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full border-[6px] border-[#0f172a] bg-[#0a0c10] overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] relative z-20 group-hover:border-red-600 transition-all duration-500">
                                <div className="absolute inset-0 opacity-10 line-pattern pointer-events-none" />
                                
                                {previews.profile && (
                                    <img 
                                        key={`profile-${previews.profile.length}`}
                                        src={previews.profile} 
                                        alt=""
                                        className="w-full h-full object-cover transition-opacity duration-500"
                                    />
                                )}
                                
                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 z-30 backdrop-blur-sm">
                                    <Camera size={32} className="text-white mb-1" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Update Icon</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleAssetUpload('profile', e.target.files[0])} />
                                </label>
                                
                                {uploading.profile && (
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40">
                                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent animate-spin rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)]" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions Control Deck */}
                        <div className="absolute top-10 right-6 sm:right-14 flex items-center gap-4">
                            <button 
                                type="submit" 
                                disabled={isSaving || uploading.profile || uploading.banner}
                                className="px-14 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-red-900 transition-all shadow-[0_15px_30px_-5px_rgba(220,38,38,0.4)] active:scale-95 disabled:opacity-50 border-b-4 border-red-900"
                            >
                                {isSaving ? 'updating...' : 'update profles'}
                            </button>
                        </div>

                        {/* Creator Inputs Portfolio */}
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl">
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Creator Handle</label>
                                    <input 
                                        type="text" 
                                        value={formData.displayName}
                                        onChange={(e) => setFormData(p => ({ ...p, displayName: e.target.value }))}
                                        className="w-full bg-[#0a0c10] border border-white/5 rounded-3xl px-8 py-5 text-sm font-bold text-white focus:border-red-600/30 transition-all outline-none"
                                        placeholder="Pick a unique handle..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Identity Brief (Bio)</label>
                                    <textarea 
                                        value={formData.bio}
                                        onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                                        rows={5}
                                        className="w-full bg-[#0a0c10] border border-white/5 rounded-3xl px-8 py-5 text-[11px] font-medium text-zinc-400 focus:border-red-600/30 transition-all outline-none resize-none leading-relaxed"
                                        placeholder="Briefly describe your craft..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">External Presence</label>
                                    
                                    <div className="flex gap-4">
                                        <div className="relative flex-1">
                                            <LinkIcon size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700" />
                                            <input 
                                                type="text" 
                                                value={socialInput}
                                                onChange={(e) => setSocialInput(e.target.value)}
                                                className="w-full bg-[#0a0c10] border border-white/5 rounded-3xl pl-14 pr-6 py-5 text-xs text-white focus:border-red-600/30 transition-all outline-none font-bold"
                                                placeholder="e.g. Spotify, YouTube, yourwebsite.com..."
                                            />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={addSocialLink} 
                                            className="px-8 bg-zinc-800 text-white rounded-[1.5rem] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shadow-lg active:scale-95 border-b-2 border-zinc-950"
                                        >
                                            <Plus size={24} />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-3 pt-3 min-h-[50px]">
                                        {formData.socialLinks.map((link, i) => (
                                            <div key={i} className="flex items-center gap-4 px-5 py-2.5 bg-[#141b2a] rounded-2xl text-[10px] text-zinc-400 font-black border border-white/5 hover:border-red-600/40 transition-all animate-in zoom-in slide-in-from-left-2 duration-300">
                                                <Globe size={14} className="text-red-600/40" />
                                                <span className="truncate max-w-[140px] tracking-tighter">{link}</span>
                                                <button type="button" onClick={() => removeSocialLink(i)} className="text-zinc-600 hover:text-red-500 transition-colors">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditProfileForm;

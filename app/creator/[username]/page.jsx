'use client';

import React, { useEffect, useState, use } from 'react';
import ProfileView from '@/components/profile/ProfileView';
import EditProfileForm from '@/components/profile/EditProfileForm';
import { Loader2, AlertCircle, Edit3, Eye, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { BACKEND_URL } from '@/lib/apiConfig';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicProfilePage({ params }) {
    const { username } = use(params);
    const [profile, setProfile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch public profile
                const profileRes = await fetch(`${BACKEND_URL}/api/creator/${username}`);
                if (!profileRes.ok) {
                    const data = await profileRes.json();
                    throw new Error(data.error || 'Failed to fetch creator profile');
                }
                const profileData = await profileRes.json();
                setProfile(profileData);

                // Fetch current user session
                const { data: { user } } = await supabase.auth.getUser();
                setCurrentUser(user);

            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchData();
        }
    }, [username, supabase.auth]);

    const handleSave = async (updatedData) => {
        setSaving(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/creator/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            if (!res.ok) throw new Error('Failed to save profile');

            const newData = await res.json();
            setProfile(newData.data || updatedData);
            setIsEditing(false);
            router.refresh(); 
        } catch (err) {
            console.error(err);
            alert('Error saving profile: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#06080C] gap-6">
                <div className="relative">
                    <div className="w-24 h-24 border-2 border-red-600/20 rounded-full animate-[spin_3s_linear_infinite]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-white font-black uppercase tracking-[0.4em] text-[10px]">Retrieving Channel</p>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[8px] animate-pulse">Establishing secure link to Sawa Network</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#06080C] p-6 text-center">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-red-600/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-red-600/20 shadow-2xl shadow-red-600/10"
                >
                    <AlertCircle className="w-10 h-10 text-red-600" />
                </motion.div>
                <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Profile Not Found</h1>
                <p className="text-zinc-500 mb-10 max-w-md font-medium leading-relaxed italic text-sm">
                    "{error}"
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link
                        href="/"
                        className="px-10 py-4 border border-zinc-800 text-zinc-400 rounded-full font-black text-[10px] tracking-widest uppercase hover:bg-white/5 hover:text-white transition-all active:scale-95"
                    >
                        Return Home
                    </Link>
                    <Link
                        href="/dashboard"
                        className="px-10 py-4 bg-red-600 text-white rounded-full font-black text-[10px] tracking-widest uppercase hover:bg-red-500 transition-all shadow-2xl shadow-red-600/20 active:scale-95"
                    >
                        Creator Login
                    </Link>
                </div>
            </div>
        );
    }

    const isOwner = currentUser && (profile?.id === currentUser.id || profile?.userId === currentUser.id);

    return (
        <div className="relative min-h-screen bg-[#06080C]">
            <AnimatePresence mode="wait">
                {isEditing ? (
                    <motion.div 
                        key="editing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-w-6xl mx-auto px-6 py-20"
                    >
                        <div className="mb-16 flex items-start justify-between">
                            <div className="space-y-4">
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group mb-4"
                                >
                                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Channel</span>
                                </button>
                                <h2 className="text-5xl font-black text-white tracking-tighter leading-tight">
                                    Channel <span className="text-red-600">Customization</span>
                                </h2>
                                <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Configure your public presence and brand identity</p>
                            </div>
                            <div className="hidden md:flex flex-col items-end gap-2 pt-12">
                                <div className="px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-xl">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Live Preview Enabled</span>
                                </div>
                            </div>
                        </div>
                        <EditProfileForm
                            initialData={profile}
                            onSave={handleSave}
                            isSaving={saving}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="viewing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <ProfileView profile={profile} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button (FAB) for Owners */}
            {isOwner && (
                <div className="fixed bottom-10 right-10 z-[110]">
                    <motion.button
                        layout
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-4 px-8 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all group ${
                            isEditing 
                            ? 'bg-zinc-800 text-white border border-white/10 hover:bg-zinc-700' 
                            : 'bg-white text-black hover:shadow-[0_20px_50px_rgba(255,255,255,0.1)]'
                        }`}
                    >
                        {isEditing ? (
                            <>
                                <Eye className="w-5 h-5 text-red-600" />
                                <span>Preview Channel</span>
                            </>
                        ) : (
                            <>
                                <div className="p-2 bg-red-600/10 rounded-xl group-hover:bg-red-600 transition-colors">
                                    <Edit3 className="w-4 h-4 text-red-600 group-hover:text-white" />
                                </div>
                                <span className="text-black">Customize Channel</span>
                            </>
                        )}
                    </motion.button>
                </div>
            )}
        </div>
    );
}

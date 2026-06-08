'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditProfileForm from '@/components/profile/EditProfileForm';
import { ProfileFormSkeleton } from '@/components/Dashboard/Skeletons';
import { Plus, Sparkles, ArrowLeft } from 'lucide-react';
import StatusModal from '@/components/Dashboard/StatusModal';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function EditProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modalConfig, setModalConfig] = useState({ show: false, type: 'success', title: '', message: '' });
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/creator/profile');
                if (!res.ok) throw new Error('Failed to fetch profile');
                const data = await res.json();
                setProfile(data);
            } catch (err) {
                console.error('Profile fetch error:', err);
                setModalConfig({ 
                    show: true, 
                    type: 'error', 
                    title: 'Failed to Load Profile',
                    message: err instanceof Error ? err.message : 'Unable to load your profile. Please try again.'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const showModal = (type, title, message) => {
        setModalConfig({ show: true, type, title, message });
    };

    const handleSave = async (updatedData) => {
        setSaving(true);
        try {
            const res = await fetch('/api/creator/profile', {
                method: 'PUT',
                headers: { 
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Failed to save profile');
            }
            
            showModal('success', 'Identity Synchronized', 'Your profile updates have been successfully pushed to the Sawa Network.');
        } catch (err) {
            console.error('Save error:', err);
            showModal('error', 'Update Failed', err instanceof Error ? err.message : 'There was an error saving your changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#06080C] py-20 px-6 flex flex-col items-center">
                <div className="w-full max-w-4xl space-y-12">
                    <div className="space-y-4">
                        <div className="w-32 h-4 bg-zinc-900 rounded-full animate-pulse" />
                        <div className="w-64 h-10 bg-zinc-900 rounded-2xl animate-pulse" />
                    </div>
                    <ProfileFormSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#06080C] selection:bg-red-500/30 font-sans pb-32">
            <div className="max-w-5xl mx-auto pt-16 px-6 relative">
                {/* Visual Status Confirmation */}
                <StatusModal 
                    isOpen={modalConfig.show}
                    onClose={() => {
                        setModalConfig(prev => ({ ...prev, show: false }));
                        if (modalConfig.type === 'success') router.push('/dashboard/profile');
                    }}
                    type={modalConfig.type}
                    title={modalConfig.title}
                    message={modalConfig.message}
                />

                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-12 mb-12"
                >
                    <div className="space-y-4">
                        <Link 
                            href="/dashboard/profile"
                            className="flex items-center gap-2 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                            Back to Profile
                        </Link>
                        <div className="space-y-1">
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                                Customize <span className="text-red-600">Identity</span>
                            </h1>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Manage your public presence and brand aesthetics</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-xl">
                        <Sparkles className="w-3.5 h-3.5 text-red-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Live Customization</span>
                    </div>
                </motion.div>

                <div className="transition-all duration-700">
                    <EditProfileForm 
                        initialData={profile} 
                        onSave={handleSave} 
                        isSaving={saving} 
                        verificationStatus={profile?.verificationStatus}
                        rejectionFeedback={profile?.rejectionFeedback}
                    />
                </div>

                {/* Creator Program Call-to-Action */}
                {profile?.verificationStatus === 'none' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20 p-1 bg-gradient-to-r from-red-600/20 via-zinc-800 to-red-900/20 rounded-[3rem] shadow-2xl"
                  >
                    <div className="bg-[#0B0E14] rounded-[2.8rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-red-600/20">
                          <Sparkles className="text-white w-10 h-10" />
                        </div>
                        <div className="space-y-2 text-center md:text-left">
                          <h5 className="text-2xl font-black text-white tracking-tight uppercase italic">Join the Creator Network</h5>
                          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest max-w-sm">Unlock premium tools, monetization, and advanced analytics for your channel.</p>
                        </div>
                      </div>
                      <Link 
                        href="/creator/verify" 
                        className="w-full md:w-auto px-12 py-5 bg-red-600 hover:bg-red-500 text-white font-black tracking-[0.2em] text-xs uppercase transition-all shadow-2xl shadow-red-600/20 flex items-center justify-center gap-4 group rounded-2xl active:scale-95"
                      >
                        Apply Now <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                )}
            </div>
        </div>
    );
}

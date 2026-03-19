'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditProfileForm from '@/components/profile/EditProfileForm';
import { ProfileFormSkeleton } from '@/components/Dashboard/Skeletons';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/creator/profile');
                if (!res.ok) throw new Error('Failed to fetch profile');
                const data = await res.json();
                setProfile(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (updatedData) => {
        setSaving(true);
        try {
            const res = await fetch('/api/creator/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            if (!res.ok) throw new Error('Failed to save profile');
            
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                router.push('/dashboard');
            }, 2000);
        } catch (err) {
            console.error(err);
            alert('Error saving profile: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto py-12 px-4">
                <div className="w-48 h-6 bg-gray-800 rounded mb-4 animate-pulse" />
                <ProfileFormSkeleton />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-32 px-4 relative">
            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-white text-green-600 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-black text-sm uppercase tracking-widest">Profile Saved Successfully!</span>
                </div>
            )}

            <div className="flex items-center justify-between border-b border-gray-800 pb-6 pt-12">
                <div>
                    <Link 
                        href="/dashboard"
                        className="flex items-center gap-2 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest mb-2 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-black text-white tracking-tight">Edit Your <span className="text-red-500">Profile</span></h1>
                </div>
            </div>

            <EditProfileForm 
                initialData={profile} 
                onSave={handleSave} 
                isSaving={saving} 
                verificationStatus={profile?.verificationStatus}
            />
        </div>
    );
}

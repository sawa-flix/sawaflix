'use client';

import React, { useEffect, useState } from 'react';
import ProfileView from '@/components/profile/ProfileView';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PublicProfilePage({ params }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPublicProfile = async () => {
            try {
                const res = await fetch(`/api/creator/${params.username}`);
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to fetch creator profile');
                }
                const data = await res.json();
                setProfile(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (params.username) {
            fetchPublicProfile();
        }
    }, [params.username]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0E14] gap-4">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Retrieving Creator Profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0E14] p-6 text-center">
                <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-2xl font-black text-white mb-4">Profile Unavailable</h1>
                <p className="text-gray-400 mb-8 max-w-md font-medium leading-relaxed italic">
                    "{error}"
                </p>
                <div className="flex gap-4">
                    <Link 
                        href="/"
                        className="px-8 py-3 border border-gray-800 text-white rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white/5 transition-all"
                    >
                        Return Home
                    </Link>
                    <Link 
                        href="/dashboard"
                        className="px-8 py-3 bg-red-600 text-white rounded-full font-bold text-sm tracking-widest uppercase hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
                    >
                        Creator Login
                    </Link>
                </div>
            </div>
        );
    }

    return <ProfileView profile={profile} />;
}

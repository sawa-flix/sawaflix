'use client';

import React, { useEffect, useState } from 'react';
import PendingState from '@/components/Dashboard/PendingState';
import ApprovedDashboard from '@/components/Dashboard/ApprovedDashboard';
import RejectedState from '@/components/Dashboard/RejectedState';
import { StatsSkeleton, DashboardHeaderSkeleton } from '@/components/Dashboard/Skeletons';

export default function DashboardPage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const visitorId = localStorage.getItem('sawaflix_visitor_id');
                const res = await fetch('/api/creator/profile', {
                    headers: visitorId ? { 'x-visitor-id': visitorId } : {}
                });
                if (!res.ok) throw new Error('Failed to fetch profile');
                const data = await res.json();
                setProfile(data);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <DashboardHeaderSkeleton />
                <StatsSkeleton />
                <div className="h-64 bg-[#141820] border border-gray-800 rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center max-w-md mx-auto my-12">
                <h3 className="text-red-500 font-black text-xl mb-2">Connection Issue</h3>
                <p className="text-gray-400 mb-6 font-medium">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-2.5 bg-red-600 text-white rounded-full font-bold text-sm hover:bg-red-700 transition-all"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    // Conditional Rendering based on verificationStatus
    if (profile?.verificationStatus === 'pending') {
        return <PendingState userProfile={profile} />;
    }

    if (profile?.verificationStatus === 'approved') {
        return <ApprovedDashboard creatorName={profile.displayName} userProfile={profile} />;
    }

    if (profile?.verificationStatus === 'rejected') {
        return <RejectedState feedback={profile.rejectionFeedback} />;
    }

    // Default Case (Status 'none' or not started)
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl text-red-600 font-bold">!</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-4">Start Your <span className="text-red-500">Creator Journey</span></h1>
            <p className="text-gray-400 mb-8 font-medium leading-relaxed">
                You haven't applied for the SawaFlix Creator Program yet. 
                Complete our 5-step verification to unlock exclusive features and monetize your craft.
            </p>
            <a 
                href="/creator/verify"
                className="px-10 py-4 bg-red-600 text-white rounded-full font-black text-sm hover:bg-red-700 hover:scale-105 transition-all shadow-xl shadow-red-600/20 uppercase tracking-widest"
            >
                Get Verified Now
            </a>
        </div>
    );
}

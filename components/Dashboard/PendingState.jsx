'use client';
import React from 'react';
import { Clock, ShieldCheck, Lock } from 'lucide-react';
import CreatorDashboard from './CreatorDashboard';
import ReviewDetail from '@/components/admin/ReviewDetail';

const PendingState = ({ userProfile }) => {
    // Form data structure for ReviewDetail
    const submissionData = {
        id: 'me',
        full_name: userProfile?.displayName,
        email: userProfile?.email,
        verification_submissions: {
            category: userProfile?.category,
            form_data: userProfile?.formData || {}
        }
    };

    return (
        <div className="relative min-h-screen bg-[#0B0E14] overflow-x-hidden">
            {/* Background Branding */}
            <div className="absolute top-0 right-0 p-10 opacity-10">
                <ShieldCheck className="w-64 h-64 text-red-600" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                {/* Status Bar */}
                <div className="bg-[#141820] border border-red-600/20 rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-600/10 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-red-600 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Verification Under Review</h2>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Typical response time: 24-48 hours</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 px-6 py-3 bg-red-600/10 border border-red-600/20 rounded-full">
                        <Lock className="w-4 h-4 text-red-500" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Restricted Access Mode</span>
                    </div>
                </div>

                <div className="space-y-4 mb-12">
                     <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] ml-1">Your Submission Details</h3>
                     <div className="w-full h-px bg-gradient-to-r from-red-600/40 to-transparent" />
                </div>

                {/* The detailed review view (Non-admin version) */}
                <div className="pointer-events-none opacity-90 select-none grayscale-[0.2]">
                    <ReviewDetail 
                        creator={submissionData} 
                        isAdmin={false} 
                    />
                </div>
            </div>

            {/* Footer Notice */}
            <div className="fixed bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#0B0E14] to-transparent text-center z-20">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">
                    SawaFlix Cultural Verification Program &bull; 2026
                </p>
            </div>
        </div>
    );
};

export default PendingState;

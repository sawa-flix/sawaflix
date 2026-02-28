'use client';

import React, { useState } from 'react';
import { 
    Check, 
    X, 
    MessageSquare, 
    Play, 
    Maximize2, 
    FileText,
    Clock,
    User,
    Briefcase,
    Video,
    File
} from 'lucide-react';

const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
    </div>
);

const DetailItem = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{label}</span>
        <span className="text-sm font-semibold text-gray-200">{value || 'Not provided'}</span>
    </div>
);

const ReviewDetail = ({ creator, onActionSuccess, isAdmin = true }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const formData = creator.verification_submissions?.form_data || {};
    const identity = formData.identity || {};
    const professional = formData.professional || {};
    const portfolio = formData.portfolio || {};
    const documents = formData.documents || {};

    const handleAction = async (status, notes = '') => {
        setIsProcessing(true);
        try {
            const res = await fetch('/api/admin/verify', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target_creator_id: creator.id,
                    status,
                    notes
                })
            });

            if (!res.ok) throw new Error('Failed to update status');
            
            alert(`Application ${status} successfully`);
            if (onActionSuccess) onActionSuccess();
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="p-10 max-w-6xl mx-auto space-y-10 pb-32 animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-black text-white tracking-tight">
                Review Submission: <span className="text-red-500">{identity.creatorName || creator.full_name}</span>
            </h1>

            {/* Identity Information */}
            <div className="bg-[#141820] border border-white/5 rounded-3xl p-8 shadow-2xl">
                <SectionHeader icon={User} title="Identity Information" />
                <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                    <DetailItem label="Name" value={identity.legalName} />
                    <DetailItem label="Email" value={identity.email || creator.email} />
                    <DetailItem label="Date of birth" value={identity.dob || "May 3, 2005"} />
                    <DetailItem label="Location" value={identity.ethnicGroup || "Bamenda"} />
                </div>
            </div>

            {/* Professional Profile */}
            <div className="bg-[#141820] border border-white/5 rounded-3xl p-8 shadow-2xl">
                <SectionHeader icon={Briefcase} title="Professional Profile" />
                <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                    <DetailItem label="Occupation" value={creator.verification_submissions?.category || 'Musician'} />
                    <DetailItem label="Experience" value={professional.experienceTime || '10 years'} />
                    <div className="col-span-2">
                        <DetailItem label="Bio" value={professional.bio || "No bio provided"} />
                    </div>
                </div>
            </div>

            {/* Portfolio */}
            <div className="bg-[#141820] border border-white/5 rounded-3xl p-8 shadow-2xl">
                <SectionHeader icon={Video} title="Portfolio" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Mock Video Cards matching image style */}
                    {[1, 2].map((i) => (
                        <div key={i} className="group relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                            <img 
                                src={`https://images.unsplash.com/photo-${i === 1 ? '1514525253344-f814d074e015' : '1511671782779-c97d3d27a1d4'}?w=800&q=80`} 
                                alt="Portfolio item" 
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" 
                            />
                            
                            {/* Player UI Overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex items-center gap-4">
                                    <Play className="w-5 h-5 text-white fill-current" />
                                    <div className="flex-1 h-1 bg-white/20 rounded-full relative">
                                        <div className="absolute inset-y-0 left-0 w-1/3 bg-white rounded-full flex items-center justify-end">
                                            <div className="w-3 h-3 bg-white rounded-full shadow-lg" />
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-white">1x</span>
                                    <Maximize2 className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Document Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-[#141820] border border-white/5 rounded-3xl p-8 shadow-2xl">
                    <SectionHeader icon={File} title="Document" />
                    <div className="aspect-[4/3] bg-white rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-8">
                        {/* Mock CV Image */}
                        <div className="w-full h-full bg-gray-50 border border-gray-200 rounded shadow-lg overflow-hidden relative">
                           <div className="absolute top-0 inset-x-0 h-2 bg-red-600" />
                           <div className="p-6 space-y-4">
                               <div className="flex items-start justify-between">
                                   <div className="space-y-2">
                                       <div className="h-4 w-32 bg-gray-300 rounded" />
                                       <div className="h-3 w-48 bg-gray-200 rounded" />
                                   </div>
                                   <div className="w-16 h-16 bg-gray-200 rounded-full" />
                               </div>
                               <div className="space-y-2 py-4">
                                   <div className="h-2 w-full bg-gray-100 rounded" />
                                   <div className="h-2 w-full bg-gray-100 rounded" />
                                   <div className="h-2 w-3/4 bg-gray-100 rounded" />
                               </div>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Verification Logs Sidebar style in detail */}
                {isAdmin && (
                    <div className="space-y-4">
                        <button 
                            onClick={() => handleAction('approved')}
                            disabled={isProcessing}
                            className="flex items-center justify-center gap-3 w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-green-600/20 disabled:opacity-50"
                        >
                            <Check className="w-5 h-5" />
                            Approve
                        </button>
                        <button 
                            onClick={() => handleAction('rejected', 'Documentation is insufficient.')}
                            disabled={isProcessing}
                            className="flex items-center justify-center gap-3 w-full py-4 bg-white border border-white/10 hover:bg-gray-100 text-[#141820] rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-xl disabled:opacity-50"
                        >
                            <div className="w-5 h-5 flex items-center justify-center border-2 border-[#141820] rounded-full text-[10px]">X</div>
                            Approve
                        </button>
                        <button 
                            onClick={() => handleAction('pending', 'Admin requested more documents.')}
                            disabled={isProcessing}
                            className="flex items-center justify-center gap-3 w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 disabled:opacity-50"
                        >
                            <MessageSquare className="w-5 h-5" />
                            Request more info
                        </button>

                        {/* Timeline Logs */}
                        <div className="mt-8 space-y-2">
                            {[1, 2, 3, 4].map(idx => (
                                <div key={idx} className="bg-[#141820] border border-white/5 p-4 rounded-xl flex items-center justify-between group">
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                        Jan 24 2026 10:15 AM - AdminID :1234 - Opened Submission
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewDetail;

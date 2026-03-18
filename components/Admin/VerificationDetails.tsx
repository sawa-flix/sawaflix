'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    MessageCircle,
    FileText,
    Download,
    ExternalLink,
    Play,
    User,
    Calendar,
    MapPin,
    Globe,
    Eye,
    Loader2 // Import Loader for loading state
} from 'lucide-react';
import { useAdminNotifications } from '../../contexts/AdminNotificationContext';

interface VerificationData {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    identity: {
        fullName: string;
        stageName?: string;
        email: string;
        phone: string;
        dob?: string;
        nationality?: string;
        avatarUrl?: string;
    };
    professional: {
        category: string;
        bio: string;
        yearsActive: number;
        // Category specific
        ethnicGroup?: string; // Storyteller
        languages?: string[]; // Storyteller, Comedian
        focusArea?: string; // Food
        signatureDishes?: string; // Food
        roles?: string[]; // Actor
        filmography?: string; // Actor
        genre?: string[]; // Music
        label?: string; // Music
    };
    portfolio: {
        links: { url: string; type: 'youtube' | 'spotify' | 'other' }[];
        videos: { url: string; title: string, description?: string }[];
    };
    documents: {
        idCardUrl: string; // Image or PDF
        selfieUrl?: string; // Image
        endorsementUrl?: string; // PDF/Image (Storyteller)
        distributorProofUrl?: string; // Image (Music)
        productionProofUrl?: string; // Image/PDF (Actor)
        foodLicenseUrl?: string; // Image/PDF (Food)
        verificationVideoUrl?: string; // Video (Comedian, Food)
    };
}

export default function VerificationDetails({ id }: { id: string }) {
    const [data, setData] = useState<VerificationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionModal, setActionModal] = useState<'approve' | 'reject' | 'info' | null>(null);
    const [feedback, setFeedback] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const { addNotification } = useAdminNotifications();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/verifications/${id}`);
                if (!res.ok) throw new Error('Failed to fetch verification details');
                const result = await res.json();
                setData(result.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load verification details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleAction = async (type: 'approve' | 'reject' | 'info') => {
        setActionLoading(true);
        const statusMap = {
            approve: 'approved',
            reject: 'rejected',
            info: 'info_requested'
        };

        try {
            const res = await fetch(`/api/admin/verify`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    target_creator_id: id, 
                    status: statusMap[type],
                    notes: feedback || `Action performed: ${type}`
                })
            });

            if (!res.ok) throw new Error(`Failed to ${type} verification`);

            // Notifications
            const creatorName = data?.identity.fullName || 'Creator';
            addNotification({
                type: type === 'approve' ? 'approved' : type === 'reject' ? 'rejected' : 'info',
                title: type === 'approve' ? 'Creator Approved' : type === 'reject' ? 'Creator Rejected' : 'Info Requested',
                message: `${creatorName} has been ${type === 'approve' ? 'approved' : type === 'reject' ? 'rejected' : 'sent a request for more info'}.`
            });

            // Optimistic Update
            if (data) {
                if (type === 'approve') setData({ ...data, status: 'approved' });
                if (type === 'reject') setData({ ...data, status: 'rejected' });
            }

            setActionModal(null);
            setFeedback('');
        } catch (err) {
            console.error(err);
            addNotification({
                type: 'info',
                title: 'Action Failed',
                message: `Failed to ${type} ${data?.identity.fullName || 'this creator'}. Please try again.`
            });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-red-600" size={48} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
                <XCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Error Loading Data</h2>
                <p className="text-gray-400 mb-6">{error || 'Verification request not found.'}</p>
                <Link href="/admin" className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                    Back to Queue
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Verification Review</h1>
                    <p className="text-gray-400 text-sm">Submission ID: #{id}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${data.status === 'approved' ? 'bg-green-500/20 text-green-500 border-green-500/20' :
                        data.status === 'rejected' ? 'bg-red-500/20 text-red-500 border-red-500/20' :
                            'bg-yellow-500/20 text-yellow-500 border-yellow-500/20'
                        }`}>
                        {data.status.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Identity & Professional Info */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Section 1: Identity */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <User size={18} className="text-red-500" />
                            Identity
                        </h2>

                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700 relative bg-gray-800 flex items-center justify-center">
                                {data.identity.avatarUrl ? (
                                    <img src={data.identity.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-bold text-2xl">
                                        {data.identity.fullName?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 block">Full Legal Name</label>
                                <div className="text-white font-medium">{data.identity.fullName}</div>
                            </div>
                            {data.identity.stageName && (
                                <div>
                                    <label className="text-xs text-gray-500 block">Stage Name</label>
                                    <div className="text-white font-medium">{data.identity.stageName}</div>
                                </div>
                            )}
                            <div>
                                <label className="text-xs text-gray-500 block">Email</label>
                                <div className="text-gray-300 break-all">{data.identity.email}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block">Phone</label>
                                <div className="text-gray-300">{data.identity.phone}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 block">Date of Birth</label>
                                    <div className="text-gray-300">{data.identity.dob}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block">Nationality</label>
                                    <div className="text-gray-300">{data.identity.nationality}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Professional Profile */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Globe size={18} className="text-red-500" />
                            Professional Profile
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 block">Category</label>
                                <div className="inline-block mt-1 px-3 py-1 rounded-full bg-red-600/10 text-red-500 text-sm font-medium border border-red-600/20">
                                    {data.professional.category}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 block">Bio</label>
                                <div className="text-gray-300 text-sm mt-1 leading-relaxed">
                                    {data.professional.bio}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 block">Years Active</label>
                                    <div className="text-white font-medium">{data.professional.yearsActive} Years</div>
                                </div>
                                {data.professional.label && (
                                    <div>
                                        <label className="text-xs text-gray-500 block">Label/Affiliation</label>
                                        <div className="text-white font-medium">{data.professional.label}</div>
                                    </div>
                                )}
                            </div>

                            {/* Category Specific Fields */}
                            {data.professional.genre && (
                                <div>
                                    <label className="text-xs text-gray-500 block">Genres</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {data.professional.genre.map(g => (
                                            <span key={g} className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-xs border border-gray-700">{g}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Portfolio & Documents */}
                <div className="space-y-6 lg:col-span-2">

                    {/* Section 3: Portfolio */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Play size={18} className="text-red-500" />
                            Portfolio & Content
                        </h2>

                        {/* Links */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Social & Streaming</h3>
                            <div className="flex flex-wrap gap-3">
                                {data.portfolio.links.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700"
                                    >
                                        <ExternalLink size={14} />
                                        <span className="text-sm">{link.type}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Videos */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Submitted Videos</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {data.portfolio.videos.map((video, i) => (
                                    <div key={i} className="group relative aspect-video bg-black rounded-lg overflow-hidden border border-gray-800">
                                        {/* In real app, render actual Embed/Player. Placeholder for now. */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                            <Play size={32} className="text-gray-600 group-hover:text-red-500 transition-colors" />
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                            <p className="text-white text-sm font-medium truncate">{video.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Documents */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <FileText size={18} className="text-red-500" />
                            Documents & Verification
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* National ID */}
                            {data.documents.idCardUrl && (
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">National ID / Passport</label>
                                    <div className="relative aspect-[3/2] bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group cursor-pointer">
                                        <img
                                            src={data.documents.idCardUrl}
                                            alt="ID Card"
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Eye className="text-white" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Selfie */}
                            {data.documents.selfieUrl && (
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Selfie with ID</label>
                                    <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group cursor-pointer max-w-[200px]">
                                        <img
                                            src={data.documents.selfieUrl}
                                            alt="Selfie"
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Eye className="text-white" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Other Docs */}
                            {Object.entries(data.documents).map(([key, url]) => {
                                if (key === 'idCardUrl' || key === 'selfieUrl') return null;
                                if (!url) return null;
                                return (
                                    <div key={key} className="space-y-2">
                                        <label className="text-sm text-gray-400 font-medium capitalize">{key.replace('Url', '').replace(/([A-Z])/g, ' $1')}</label>
                                        <a
                                            href={url}
                                            target="_blank"
                                            className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors"
                                        >
                                            <div className="p-2 bg-red-500/10 rounded text-red-500">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">Document File</p>
                                                <p className="text-xs text-gray-500">Click to view</p>
                                            </div>
                                            <ExternalLink size={16} className="text-gray-500" />
                                        </a>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                </div>
            </div>

            {/* Action Footer (Sticky) */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-gray-900 border-t border-gray-800 p-4 z-40">
                <div className="max-w-5xl mx-auto flex justify-end gap-3">
                    <button
                        onClick={() => setActionModal('info')}
                        disabled={actionLoading}
                        className="px-6 py-2.5 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors border border-gray-700 flex items-center gap-2"
                    >
                        <MessageCircle size={18} />
                        Request Info
                    </button>

                    <button
                        onClick={() => setActionModal('reject')}
                        disabled={actionLoading}
                        className="px-6 py-2.5 rounded-xl bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-colors border border-red-500/20 flex items-center gap-2"
                    >
                        <XCircle size={18} />
                        Reject
                    </button>

                    <button
                        onClick={() => setActionModal('approve')}
                        disabled={actionLoading}
                        className="px-8 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20 flex items-center gap-2"
                    >
                        {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                        Approve Verification
                    </button>
                </div>
            </div>

            {/* Modals */}
            {actionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-800 shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-800 mb-0">
                            <h3 className="text-xl font-bold text-white mb-1">
                                {actionModal === 'approve' ? 'Confirm Approval' : actionModal === 'reject' ? 'Reject Submission' : 'Request Information'}
                            </h3>
                            <p className="text-gray-400 text-sm">
                                {actionModal === 'approve'
                                    ? 'Are you sure you want to approve this creator? They will gain full access immediately.'
                                    : 'Please provide a reason or message for the creator.'}
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            {actionModal !== 'approve' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Message to Creator</label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="w-full h-32 bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:ring-red-500 focus:border-red-500"
                                        placeholder="Explain what is missing or incorrect..."
                                    ></textarea>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setActionModal(null)}
                                    disabled={actionLoading}
                                    className="px-4 py-2 rounded-lg bg-transparent text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleAction(actionModal)}
                                    disabled={actionLoading}
                                    className={`px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${actionModal === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                                        actionModal === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                                            'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    {actionLoading && <Loader2 className="animate-spin" size={16} />}
                                    {actionModal === 'approve' ? 'Confirm Approve' : 'Send Message'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

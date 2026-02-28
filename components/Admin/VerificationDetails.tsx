'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    MessageCircle,
    FileText,
    ExternalLink,
    Play,
    User,
    Clock,
    Globe,
    Eye,
    Loader2,
    AlertCircle,
} from 'lucide-react';

interface VerificationData {
    id: string;
    status: 'pending' | 'approved' | 'rejected' | 'info_requested';
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
        ethnicGroup?: string;
        languages?: string[];
        focusArea?: string;
        signatureDishes?: string;
        roles?: string[];
        filmography?: string;
        genre?: string[];
        label?: string;
    };
    portfolio: {
        links: { url: string; type: 'youtube' | 'spotify' | 'other' }[];
        videos: { url: string; title: string; description?: string }[];
    };
    documents: {
        idCardUrl: string;
        selfieUrl?: string;
        endorsementUrl?: string;
        distributorProofUrl?: string;
        productionProofUrl?: string;
        foodLicenseUrl?: string;
        verificationVideoUrl?: string;
    };
}

// Simple Toast notification
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border transition-all animate-in slide-in-from-top duration-300 ${type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
}

export default function VerificationDetails({ id }: { id: string }) {
    const router = useRouter();
    const [data, setData] = useState<VerificationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionModal, setActionModal] = useState<'approve' | 'reject' | 'info' | null>(null);
    const [feedback, setFeedback] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/creators/${id}`);
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
        // Validate that feedback is provided for reject and info actions
        if ((type === 'reject' || type === 'info') && !feedback.trim()) {
            setToast({ message: 'Please enter a message before submitting.', type: 'error' });
            return;
        }

        setActionLoading(true);
        try {
            // Map internal modal type to backend status strings
            const statusMap: Record<string, string> = {
                approve: 'approved',
                reject: 'rejected',
                info: 'info_requested',
            };

            const res = await fetch(`/api/admin/verify`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: id,
                    status: statusMap[type],
                    feedback: feedback.trim(),
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `Failed to perform action: ${type}`);
            }

            setActionModal(null);
            setFeedback('');

            if (type === 'approve') {
                setToast({ message: 'Creator approved successfully! Redirecting...', type: 'success' });
                setTimeout(() => router.push('/admin'), 1500);
            } else if (type === 'reject') {
                setToast({ message: 'Submission rejected. Redirecting...', type: 'success' });
                setTimeout(() => router.push('/admin'), 1500);
            } else {
                // info_requested: stay on page, update status badge
                setToast({ message: 'Message sent to creator. Submission stays in queue.', type: 'success' });
                if (data) {
                    setData({ ...data, status: 'info_requested' });
                }
            }
        } catch (err: any) {
            console.error(err);
            setToast({ message: err.message || 'Something went wrong. Please try again.', type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const statusConfig = {
        pending: { label: 'PENDING', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20' },
        approved: { label: 'APPROVED', className: 'bg-green-500/20 text-green-500 border-green-500/20' },
        rejected: { label: 'REJECTED', className: 'bg-red-500/20 text-red-500 border-red-500/20' },
        info_requested: { label: 'INFO REQUESTED', className: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
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

    const currentStatus = statusConfig[data.status] ?? statusConfig.pending;
    const isActionable = data.status === 'pending' || data.status === 'info_requested';

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-24">
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Verification Review</h1>
                    <p className="text-gray-400 text-sm">Submission ID: #{id}</p>
                </div>
                <div className="ml-auto">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${currentStatus.className}`}>
                        {currentStatus.label}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Identity & Professional */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Identity */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <User size={18} className="text-red-500" />
                            Identity
                        </h2>

                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700">
                                <img
                                    src={data.identity.avatarUrl || `https://ui-avatars.com/api/?name=${data.identity.fullName}&background=333&color=fff`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
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

                    {/* Professional Profile */}
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
                                <div className="text-gray-300 text-sm mt-1 leading-relaxed">{data.professional.bio}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 block">Years Active</label>
                                    <div className="text-white font-medium">{data.professional.yearsActive} yrs</div>
                                </div>
                                {data.professional.label && (
                                    <div>
                                        <label className="text-xs text-gray-500 block">Label / Affiliation</label>
                                        <div className="text-white font-medium">{data.professional.label}</div>
                                    </div>
                                )}
                            </div>
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
                    {/* Portfolio */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Play size={18} className="text-red-500" />
                            Portfolio & Content
                        </h2>

                        {data.portfolio.links.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Social & Streaming</h3>
                                <div className="flex flex-wrap gap-3">
                                    {data.portfolio.links.map((link, i) => (
                                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700">
                                            <ExternalLink size={14} />
                                            <span className="text-sm capitalize">{link.type}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {data.portfolio.videos.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Submitted Videos</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {data.portfolio.videos.map((video, i) => (
                                        <a key={i} href={video.url} target="_blank" rel="noopener noreferrer"
                                            className="group relative aspect-video bg-black rounded-lg overflow-hidden border border-gray-800 block">
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                                <Play size={32} className="text-gray-600 group-hover:text-red-500 transition-colors" />
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                                <p className="text-white text-sm font-medium truncate">{video.title}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Documents */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <FileText size={18} className="text-red-500" />
                            Documents & Verification
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {data.documents.idCardUrl && (
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">National ID / Passport</label>
                                    <div className="relative aspect-[3/2] bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group cursor-pointer">
                                        <img src={data.documents.idCardUrl} alt="ID Card" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Eye className="text-white" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {data.documents.selfieUrl && (
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Selfie with ID</label>
                                    <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group cursor-pointer max-w-[200px]">
                                        <img src={data.documents.selfieUrl} alt="Selfie" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Eye className="text-white" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {Object.entries(data.documents).map(([key, url]) => {
                                if (key === 'idCardUrl' || key === 'selfieUrl' || !url) return null;
                                return (
                                    <div key={key} className="space-y-2">
                                        <label className="text-sm text-gray-400 font-medium capitalize">
                                            {key.replace('Url', '').replace(/([A-Z])/g, ' $1').trim()}
                                        </label>
                                        <a href={url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors">
                                            <div className="p-2 bg-red-500/10 rounded text-red-500"><FileText size={20} /></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">Document File</p>
                                                <p className="text-xs text-gray-500">Click to view</p>
                                            </div>
                                            <ExternalLink size={16} className="text-gray-500" />
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-gray-900/95 backdrop-blur border-t border-gray-800 p-4 z-40">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-500 hidden sm:block">
                        {!isActionable ? `This submission is already ${data.status.replace('_', ' ')}.` : 'Choose an action to proceed.'}
                    </p>
                    <div className="flex gap-3 ml-auto">
                        <button
                            onClick={() => setActionModal('info')}
                            disabled={actionLoading || !isActionable}
                            className="px-5 py-2.5 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors border border-gray-700 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <MessageCircle size={18} />
                            Request Info
                        </button>

                        <button
                            onClick={() => setActionModal('reject')}
                            disabled={actionLoading || !isActionable}
                            className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-colors border border-red-500/20 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <XCircle size={18} />
                            Reject
                        </button>

                        <button
                            onClick={() => setActionModal('approve')}
                            disabled={actionLoading || !isActionable}
                            className="px-7 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                            Approve
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Modals */}
            {actionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-800 shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-800">
                            <h3 className="text-xl font-bold text-white mb-1">
                                {actionModal === 'approve' && 'Confirm Approval'}
                                {actionModal === 'reject' && 'Reject Submission'}
                                {actionModal === 'info' && 'Request More Information'}
                            </h3>
                            <p className="text-gray-400 text-sm">
                                {actionModal === 'approve'
                                    ? `You are about to approve "${data.identity.fullName}". They will gain verified creator access immediately.`
                                    : actionModal === 'reject'
                                        ? 'This will permanently reject the submission. Provide a clear reason to the creator.'
                                        : 'The submission will stay in the queue with an "Info Requested" label until the creator resubmits.'}
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            {actionModal !== 'approve' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {actionModal === 'reject' ? 'Reason for Rejection' : 'Message to Creator'}
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white resize-none focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                                        placeholder={
                                            actionModal === 'reject'
                                                ? 'e.g. Your ID document is not clearly readable. Please resubmit with a higher quality image...'
                                                : 'e.g. Please provide a clearer selfie with your ID card visible...'
                                        }
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{feedback.length} characters</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => { setActionModal(null); setFeedback(''); }}
                                    disabled={actionLoading}
                                    className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleAction(actionModal)}
                                    disabled={actionLoading}
                                    className={`px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-colors ${actionModal === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                                        actionModal === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                                            'bg-blue-600 hover:bg-blue-700'
                                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                                >
                                    {actionLoading && <Loader2 className="animate-spin" size={16} />}
                                    {actionModal === 'approve' ? 'Confirm Approve' :
                                        actionModal === 'reject' ? 'Confirm Reject' : 'Send & Keep in Queue'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

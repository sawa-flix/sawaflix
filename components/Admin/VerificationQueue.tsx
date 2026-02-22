'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Search,
    Eye,
    Clock,
    CheckCircle2,
    XCircle,
    Inbox,
    MessageSquareDot,
    Loader2,
} from 'lucide-react';
import { createClient } from '../../utils/supabase/client';

interface VerificationItem {
    id: string;
    full_name: string;
    category: string;
    status: 'pending' | 'approved' | 'rejected' | 'info_requested';
    submitted_at: string;
    avatar_url?: string;
}

const CATEGORIES = [
    'All',
    'Traditional Storyteller',
    'Food & Lifestyle',
    'Actor/Filmmaker',
    'Comedian',
    'Music Artist',
];

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    pending: {
        label: 'Pending',
        className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20',
        icon: <Clock size={12} />,
    },
    approved: {
        label: 'Approved',
        className: 'bg-green-500/20 text-green-500 border-green-500/20',
        icon: <CheckCircle2 size={12} />,
    },
    rejected: {
        label: 'Rejected',
        className: 'bg-red-500/20 text-red-500 border-red-500/20',
        icon: <XCircle size={12} />,
    },
    info_requested: {
        label: 'Info Requested',
        className: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
        icon: <MessageSquareDot size={12} />,
    },
};

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function VerificationQueue() {
    const [items, setItems] = useState<VerificationItem[]>([]);
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/verifications');
            if (res.ok) {
                const data = await res.json();
                setItems(data.data || []);
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error('Failed to fetch verifications:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Real-time updates via Supabase Realtime
    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel('admin-verification-queue')
            .on(
                'postgres_changes',
                {
                    event: '*', // INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'creator_verifications',
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        // New submission → prepend to queue
                        const newItem = payload.new as VerificationItem;
                        setItems((prev) => [newItem, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        const updated = payload.new as VerificationItem;
                        if (updated.status === 'approved' || updated.status === 'rejected') {
                            // Remove from queue once approved/rejected
                            setItems((prev) => prev.filter((item) => item.id !== updated.id));
                        } else {
                            // Update in place (e.g. status → info_requested)
                            setItems((prev) =>
                                prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
                            );
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setItems((prev) => prev.filter((item) => item.id !== (payload.old as VerificationItem).id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredItems = items.filter((item) => {
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
        const matchesSearch = item.full_name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Verification Queue</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Review pending creator applications
                        {!loading && items.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-red-600/20 text-red-400 rounded-full text-xs font-medium border border-red-600/20">
                                {items.filter((i) => i.status === 'pending').length} pending
                            </span>
                        )}
                    </p>
                </div>

                <div className="relative flex-1 sm:w-64 w-full sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search creator..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* Category Filters */}
            <div className="flex overflow-x-auto pb-2 gap-2 border-b border-gray-800/50 scrollbar-none">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${filterCategory === cat
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                    >
                        {cat === 'All' ? 'All Requests' : cat}
                    </button>
                ))}
            </div>

            {/* Table Card */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl min-h-[400px] flex flex-col">
                {loading ? (
                    /* Skeleton rows */
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-800/50 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Creator</th>
                                    <th className="px-6 py-4 font-medium">Category</th>
                                    <th className="px-6 py-4 font-medium">Submitted</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 w-40 bg-gray-800 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-800 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-32 bg-gray-800 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-800 rounded" /></td>
                                        <td className="px-6 py-4" />
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : items.length === 0 ? (
                    /* Global Empty State */
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                            <Inbox size={32} className="text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white">No creators available for review</h3>
                        <p className="text-gray-400 mt-2 max-w-sm">
                            There are no pending verification requests at the moment. Submissions will appear here automatically when creators apply.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-800/50 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Creator</th>
                                    <th className="px-6 py-4 font-medium">Category</th>
                                    <th className="px-6 py-4 font-medium">Submitted</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => {
                                        const st = statusConfig[item.status] ?? statusConfig.pending;
                                        return (
                                            <tr key={item.id} className="group hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-gray-700 shrink-0">
                                                            <img
                                                                src={item.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.full_name)}&background=333&color=fff`}
                                                                alt={item.full_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-white">{item.full_name}</div>
                                                            <div className="text-xs text-gray-500">ID: #{item.id.substring(0, 8)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-300 bg-gray-800 px-2 py-1 rounded border border-gray-700">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                                        <Clock size={14} />
                                                        {formatDate(item.submitted_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${st.className}`}>
                                                        {st.icon}
                                                        {st.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={`/admin/verifications/${item.id}`}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-red-900/20"
                                                    >
                                                        <Eye size={16} />
                                                        Review
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No creators match your search or filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Footer */}
                        <div className="bg-gray-800/30 px-6 py-4 border-t border-gray-800 flex justify-between items-center text-sm text-gray-400">
                            <span>Showing {filteredItems.length} of {items.length} entries</span>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Live updates active
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

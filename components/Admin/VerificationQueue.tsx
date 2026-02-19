'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Search,
    Filter,
    Eye,
    Clock,
    CheckCircle2,
    XCircle,
    Inbox // Icon for empty state
} from 'lucide-react';

interface VerificationItem {
    id: string;
    full_name: string;
    category: string;
    status: 'pending' | 'approved' | 'rejected' | 'unverified';
    submitted_at: string;
    avatar_url?: string;
}

const CATEGORIES = [
    'All',
    'Traditional Storyteller',
    'Food & Lifestyle',
    'Actor/Filmmaker',
    'Comedian',
    'Music Artist'
];

export default function VerificationQueue() {
    const [items, setItems] = useState<VerificationItem[]>([]);
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Attempt to fetch real data
                const res = await fetch('/api/admin/verifications');
                if (res.ok) {
                    const data = await res.json();
                    setItems(data.data || []);
                } else {
                    // If endpoint doesn't exist or errors, we treat it as empty for now
                    setItems([]);
                }
            } catch (error) {
                console.error("Failed to fetch verifications:", error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredItems = items.filter(item => {
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
        const matchesSearch = item.full_name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20';
            case 'approved': return 'bg-green-500/20 text-green-500 border-green-500/20';
            case 'rejected': return 'bg-red-500/20 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/20 text-gray-500 border-gray-500/20';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Verification Queue</h1>
                    <p className="text-gray-400 text-sm mt-1">Review pending creator applications</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
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
            </div>

            {/* Filters (Tabs) */}
            <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2 border-b border-gray-800/50">
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

            {/* Data Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl min-h-[400px] flex flex-col">
                {items.length === 0 && !loading ? (
                    // Empty State
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                            <Inbox size={32} className="text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white">No creators available for review</h3>
                        <p className="text-gray-400 mt-2 max-w-sm">
                            There are no pending verification requests at the moment. Submissions will appear here when creators apply.
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
                                {loading ? (
                                    // Skeleton Loader
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-10 w-40 bg-gray-800 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-800 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 w-32 bg-gray-800 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-800 rounded"></div></td>
                                            <td className="px-6 py-4"></td>
                                        </tr>
                                    ))
                                ) : filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="group hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden relative border border-gray-700">
                                                        {/* In real app, use next/image */}
                                                        <img src={item.avatar_url || `https://ui-avatars.com/api/?name=${item.full_name}`} alt={item.full_name} className="w-full h-full object-cover" />
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
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                                    {item.status === 'approved' && <CheckCircle2 size={12} />}
                                                    {item.status === 'rejected' && <XCircle size={12} />}
                                                    {item.status === 'pending' && <Clock size={12} />}
                                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
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
                                    ))
                                ) : (
                                    // Empty Filter result (Separate from overall empty state)
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No creators found matching "{searchTerm}" or "{filterCategory}".
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Logic (Visual Only for now) */}
                {!loading && items.length > 0 && (
                    <div className="bg-gray-800/30 px-6 py-4 border-t border-gray-800 flex justify-between items-center text-sm text-gray-400 mt-auto">
                        <span>Showing {filteredItems.length} entries</span>
                        <div className="flex gap-2">
                            <button disabled className="px-3 py-1 rounded bg-gray-800 text-gray-600 cursor-not-allowed">Previous</button>
                            <button className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white transition-colors">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

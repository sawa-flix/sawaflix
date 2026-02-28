'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ReviewDetail from '@/components/admin/ReviewDetail';
import { Loader2 } from 'lucide-react';

export default function AdminDashboardPage() {
    const [creators, setCreators] = useState([]);
    const [selectedCreatorId, setSelectedCreatorId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCreators = async () => {
            try {
                const res = await fetch('/api/admin/creators?status=pending');
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Failed to fetch creators: ${res.status} ${text}`);
                }
                const data = await res.json();
                setCreators(data);
                if (data.length > 0) {
                    setSelectedCreatorId(data[0].id);
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCreators();
    }, []);

    const selectedCreator = creators.find(c => c.id === selectedCreatorId);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0B0E14]">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0B0E14] text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Error loading dashboard</h1>
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0B0E14] overflow-hidden text-white font-sans">
            {/* Sidebar */}
            <AdminSidebar 
                creators={creators} 
                selectedId={selectedCreatorId} 
                onSelect={setSelectedCreatorId} 
            />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {selectedCreator ? (
                    <ReviewDetail 
                        creator={selectedCreator} 
                        onActionSuccess={() => window.location.reload()} 
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 font-bold uppercase tracking-widest">No pending verifications</p>
                    </div>
                )}
            </div>
        </div>
    );
}

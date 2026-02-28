'use client';

import React from 'react';
import { LogOut, User } from 'lucide-react';

const AdminSidebar = ({ creators, selectedId, onSelect }) => {
    // Helper function for date formatting since date-fns is not installed
    const formatDate = (dateString, formatType) => {
        if (!dateString) return formatType === 'short' ? 'jan 27' : 'jan 27, 2026';
        const d = new Date(dateString);
        if (formatType === 'short') {
            return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toLowerCase();
        }
        return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toLowerCase();
    };

    return (
        <div className="w-[300px] bg-[#0F1218] border-r border-white/5 flex flex-col flex-shrink-0">
            {/* Header */}
            <div className="p-8 pb-4">
                <h1 className="text-2xl font-black text-white tracking-tight">Pending Verifications</h1>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-none">
                {creators.map((creator) => {
                    const isSelected = creator.id === selectedId;
                    const date = formatDate(creator.verification_submissions?.created_at, 'short');
                    const fullDate = formatDate(creator.verification_submissions?.created_at, 'full');

                    return (
                        <button
                            key={creator.id}
                            onClick={() => onSelect(creator.id)}
                            className={`w-full text-left p-4 rounded-xl transition-all border ${
                                isSelected 
                                    ? 'bg-red-600 border-red-500 shadow-lg shadow-red-600/20' 
                                    : 'bg-[#181C25] border-white/5 hover:border-white/10'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-black text-sm tracking-tight truncate max-w-[150px]">
                                    {creator.full_name} - {creator.verification_submissions?.category || 'Musician'}
                                </h3>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                                    {date}
                                </span>
                            </div>
                            <p className={`text-[10px] font-bold opacity-60 uppercase tracking-widest`}>
                                {fullDate} - pending
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Logout */}
            <div className="p-6 mt-auto border-t border-white/5">
                <button className="flex items-center gap-3 px-6 py-2 bg-white text-red-600 rounded-full font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all shadow-xl">
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;

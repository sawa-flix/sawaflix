'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import SawaflixLogo from '@/components/SawaflixLogo';

export default function WaitingListPage() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const supabase = createClient();

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await supabase.auth.signOut();
            if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
            }
            router.push('/login?message=signed_out');
        } catch (error) {
            console.error('Logout error:', error);
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#CE1126] selection:text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-black border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <SawaflixLogo className="!p-0 scale-75 origin-left" />
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-5 py-2 bg-transparent border border-white/20 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                >
                    {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
                <div className="max-w-2xl w-full flex flex-col items-center text-center">
                    
                    {/* Minimalist Top Indicator */}
                    <div className="w-16 h-1 bg-[#CE1126] mb-8"></div>
                    
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase mb-6 leading-tight">
                        Account Created
                    </h1>
                    
                    <p className="text-base sm:text-lg text-gray-400 font-medium leading-relaxed max-w-xl mx-auto mb-10">
                        Thank you for joining Sawaflix. We are currently rolling out dashboard access in stages to ensure optimal streaming performance for all members.
                    </p>

                    <div className="w-full border-t border-white/10 pt-8 pb-8">
                        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto uppercase tracking-widest font-semibold">
                            Our administration team reviews new account requests daily. You will receive an automated email notification the moment your dashboard access is approved and activated.
                        </p>
                    </div>

                    {/* Status Box */}
                    <div className="border border-[#CE1126]/40 bg-[#CE1126]/5 px-8 py-4 flex flex-col items-center">
                        <span className="text-[#CE1126] text-xs font-bold uppercase tracking-[0.2em] mb-1">
                            Status
                        </span>
                        <span className="text-white text-sm font-semibold uppercase tracking-wider">
                            Launching Soon
                        </span>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-8 px-6 text-center">
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Sawaflix Global Access Control
                </p>
            </footer>
        </div>
    );
}

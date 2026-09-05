'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import SawaflixLogo from '@/components/SawaflixLogo';
import { LogOut } from 'lucide-react';

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
            router.push('/dashboard?message=signed_out');
        } catch (error) {
            console.error('Logout error:', error);
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#CE1126] selection:text-white">
            {/* Header */}
            <header className="w-full px-6 py-6 flex items-center justify-between z-50">
                <SawaflixLogo className="!p-0 scale-75 origin-left" />
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#CE1126] hover:bg-[#a30d1e] text-white text-sm font-bold rounded-md transition-colors shadow-lg disabled:opacity-50"
                >
                    <LogOut size={16} />
                    {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6">
                
                {/* Sleek Card */}
                <div className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center shadow-2xl">
                    
                    <div className="w-12 h-1 bg-[#CE1126] mb-8 rounded-full"></div>
                    
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-4">
                        You're on the list!
                    </h1>
                    
                    <p className="text-base text-white font-medium leading-relaxed mb-8">
                        Account created successfully. We are rolling out access in stages.
                    </p>

                    <div className="w-full border-t border-white/10 pt-8 pb-4">
                        <p className="text-sm text-white font-semibold leading-relaxed">
                            We will notify you via
                            <span className="inline-flex items-center mx-2 font-bold px-2 py-1 bg-white/5 rounded-md border border-white/10">
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" 
                                    alt="Gmail" 
                                    className="w-4 h-4 mr-2" 
                                />
                                Email
                            </span>
                            once your dashboard is ready.
                        </p>
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="w-full py-8 px-6 text-center">
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Sawaflix Global Access
                </p>
            </footer>
        </div>
    );
}

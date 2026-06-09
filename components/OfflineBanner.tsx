'use client';

/**
 * OfflineBanner — Network-state supervisor component.
 *
 * - When ONLINE: hides itself and triggers background video pre-fetching.
 * - When OFFLINE: shows a prominent banner directing users to /dashboard/downloads
 *   where their pre-cached videos are ready to play.
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { WifiOff, Download, X, Wifi } from 'lucide-react';
import { startVideoPreload } from '@/lib/videoPreloader';

export default function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);
    const [showOnlineToast, setShowOnlineToast] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [preloading, setPreloading] = useState(false);

    const handleOnline = useCallback(async () => {
        setIsOffline(false);
        setDismissed(false);

        // Show a brief "Back Online" confirmation toast
        setShowOnlineToast(true);
        setTimeout(() => setShowOnlineToast(false), 4000);

        // Kick off background video pre-fetching now that we have connectivity
        if (!preloading) {
            setPreloading(true);
            try {
                // Run silently in the background — don't block the UI thread
                startVideoPreload(50).finally(() => setPreloading(false));
            } catch (_) {
                setPreloading(false);
            }
        }
    }, [preloading]);

    const handleOffline = useCallback(() => {
        setIsOffline(true);
        setDismissed(false);
        setShowOnlineToast(false);
    }, []);

    useEffect(() => {
        // Sync initial state with actual network status
        setIsOffline(!navigator.onLine);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // On first load while online, start pre-fetching in the background
        // Delay by 5 seconds so critical page resources load first
        if (navigator.onLine) {
            const timer = setTimeout(() => {
                startVideoPreload(50).catch(console.error);
            }, 5000);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [handleOnline, handleOffline]);

    return (
        <>
            {/* OFFLINE BANNER — persistent, dismissible */}
            {isOffline && !dismissed && (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between gap-3 px-4 py-3 bg-zinc-900 border-b border-amber-500/40 shadow-2xl shadow-black/60 animate-in slide-in-from-top duration-300"
                >
                    <div className="flex items-center gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center">
                            <WifiOff size={16} className="text-amber-400" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-semibold leading-tight">You&apos;re offline</p>
                            <p className="text-zinc-400 text-xs">Watch your downloaded videos — they&apos;re ready!</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            href="/dashboard/downloads"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors"
                        >
                            <Download size={12} />
                            Watch Offline
                        </Link>
                        <button
                            onClick={() => setDismissed(true)}
                            aria-label="Dismiss offline banner"
                            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <X size={14} className="text-zinc-400" />
                        </button>
                    </div>
                </div>
            )}

            {/* BACK ONLINE TOAST — auto-hides after 4s */}
            {showOnlineToast && (
                <div
                    role="status"
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-600/90 backdrop-blur-sm text-white text-sm font-semibold shadow-xl animate-in slide-in-from-bottom duration-300"
                >
                    <Wifi size={15} />
                    Back online
                    {preloading && (
                        <span className="text-green-200 text-xs font-normal ml-1">· Caching videos…</span>
                    )}
                </div>
            )}
        </>
    );
}

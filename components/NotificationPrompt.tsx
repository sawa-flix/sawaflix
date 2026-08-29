'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell } from 'lucide-react';
import Image from 'next/image';

export default function NotificationPrompt({ userId }: { userId?: string }) {
  const [showPrompt, setShowPrompt] = useState(false);

  // Helper function to convert VAPID key to Uint8Array
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const subscribeToPush = useCallback(async () => {
    try {
      // Check if service worker is available
      if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service workers not supported.');
        return;
      }

      // Check if there's a registered service worker
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.warn('⚠️ No service worker registered. Push notifications require a production build. Run `npm run build && npm start` to test.');
        return;
      }

      // Wait for the service worker to be ready
      const readyReg = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSub = await readyReg.pushManager.getSubscription();
      if (existingSub) {
        console.log('✅ Already subscribed to push notifications.');
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error("❌ VAPID public key is missing from environment variables.");
        return;
      }

      // Subscribe to the push service
      const subscription = await readyReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Fetch user from Supabase if userId prop wasn't provided
      let currentUserId = userId;
      if (!currentUserId) {
        try {
          const { createClient } = await import('@/utils/supabase/client');
          const supabase = createClient();
          const { data } = await supabase.auth.getUser();
          if (data?.user) {
            currentUserId = data.user.id;
          }
        } catch (e) {
          console.error("Failed to fetch user:", e);
        }
      }

      // Send the subscription to your Next.js API
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          subscription, 
          userId: currentUserId || "anonymous"
        }),
      });

      if (response.ok) {
        console.log("✅ Successfully subscribed to push notifications!");
      } else {
        console.error("❌ Failed to save subscription to database.", await response.text());
      }
    } catch (error) {
      console.error('❌ Error subscribing to push:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const dismissed = sessionStorage.getItem('notification-prompt-dismissed');
    if (dismissed) {
      return;
    }

    const permission = 'Notification' in window ? Notification.permission : 'unsupported';
    console.log(`🔔 Current notification permission: "${permission}"`);

    if (permission === 'granted') {
      subscribeToPush();
      return;
    }

    if (permission === 'denied') {
      return;
    }

    // The app keeps its own CTA rather than waiting for a native permission
    // prompt that some browsers never show. This allows the in-app banner to
    // display consistently without being blocked by browser-specific gates.
    const timer = setTimeout(() => setShowPrompt(true), 3000);
    return () => clearTimeout(timer);
  }, [subscribeToPush]);

  const handleEnable = async () => {
    if (!('Notification' in window)) {
      sessionStorage.setItem('notification-prompt-dismissed', 'true');
      setShowPrompt(false);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log(`🔔 User responded with: "${permission}"`);

      if (permission === 'granted') {
        console.log('✅ Notification permission granted.');
        await subscribeToPush();
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
    } finally {
      sessionStorage.setItem('notification-prompt-dismissed', 'true');
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('notification-prompt-dismissed', 'true');
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-5 left-5 z-[9998] w-[320px] max-w-[calc(100vw-2rem)] rounded-lg bg-[#11151c]/95 border border-white/10 shadow-2xl p-4 flex flex-col gap-3 overflow-hidden backdrop-blur-xl"
        >
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-[#666666] hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
          
          <div className="flex items-start gap-3 pr-5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E2330] to-[#0E121A] border border-white/15 flex items-center justify-center shrink-0 shadow-lg p-1.5 overflow-hidden">
              <Image 
                src="/logos_and_pwas/android-chrome-192x192.png" 
                alt="SawaFlix" 
                width={192} 
                height={192} 
                className="h-full w-full object-contain drop-shadow" 
                priority
              />
            </div>
            <div className="flex flex-col pt-0.5">
              <h3 className="text-white font-bold text-sm tracking-tight">Stay Connected with SawaFlix</h3>
              <p className="text-zinc-400 text-xs mt-1 leading-snug">Get instant alerts for new movies, music releases, and cultural stories.</p>
            </div>
          </div>
          
          <div className="flex gap-2.5 mt-1">
            <button
              onClick={handleEnable}
              className="flex-1 bg-[#CE1126] hover:bg-[#b00e1f] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#CE1126]/30 active:scale-95"
            >
              <Bell size={15} />
              Enable Alerts
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-medium py-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer border border-white/10 active:scale-95"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

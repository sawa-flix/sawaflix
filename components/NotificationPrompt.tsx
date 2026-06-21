'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, BellRing } from 'lucide-react';

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
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('🔕 Notifications not supported in this browser.');
      return;
    }

    const permission = Notification.permission;
    console.log(`🔔 Current notification permission: "${permission}"`);

    // Check if user has dismissed the prompt before (session storage — resets per session)
    const dismissed = sessionStorage.getItem('notification-prompt-dismissed');

    if (permission === 'default') {
      // Not yet asked — show the prompt after 3 seconds
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    } else if (permission === 'granted') {
      // Already granted — silently ensure push subscription exists
      subscribeToPush();
    }
    // If 'denied', do nothing — browser won't let us ask again
  }, [subscribeToPush]);

  const handleEnable = async () => {
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
          className="fixed bottom-6 left-6 z-[9998] w-[340px] max-w-[calc(100vw-3rem)] rounded-xl bg-[#111111] border border-[#222222] shadow-2xl p-5 flex flex-col gap-4 overflow-hidden"
        >
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-[#666666] hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
          
          <div className="flex items-start gap-4 pr-6">
            <div className="w-12 h-12 bg-[#222222] border border-[#333333] rounded-lg flex items-center justify-center shrink-0">
              <BellRing size={22} className="text-white" />
            </div>
            <div className="flex flex-col pt-0.5">
              <h3 className="text-white font-medium text-base tracking-tight">Stay Updated</h3>
              <p className="text-[#888888] text-sm mt-1 leading-snug">Turn on notifications to get alerts for new movies and episodes.</p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-1">
            <button
              onClick={handleEnable}
              className="flex-1 bg-white hover:bg-gray-200 text-black font-medium py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bell size={16} />
              Enable
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-[#222222] hover:bg-[#333333] text-[#aaaaaa] hover:text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

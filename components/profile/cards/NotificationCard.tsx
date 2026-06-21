'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff } from 'lucide-react';

export default function NotificationCard({ userId }: { userId?: string }) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const checkSubscription = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setLoading(false);
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const sub = await registration.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      }
    } catch (e) {
      console.error("Error checking subscription:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, [checkSubscription]);

  const handleToggle = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      alert("Push notifications are not supported in your browser.");
      return;
    }

    setLoading(true);

    try {
      if (isSubscribed) {
        // Unsubscribe
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          setIsSubscribed(false);
          // Note: ideally we'd also delete it from the DB here
        }
      } else {
        // Subscribe
        let currentPerm = permission;
        if (currentPerm === 'default') {
          currentPerm = await Notification.requestPermission();
          setPermission(currentPerm);
        }

        if (currentPerm === 'granted') {
          const registration = await navigator.serviceWorker.ready;
          const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          
          if (!vapidPublicKey) {
            console.error("VAPID public key missing.");
            return;
          }

          const subscription = await registration.pushManager.subscribe({
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

          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription, userId: currentUserId || "anonymous" }),
          });
          
          setIsSubscribed(true);
        } else {
          alert("Notification permission denied. Please enable it in your browser settings.");
        }
      }
    } catch (e) {
      console.error("Error toggling notifications:", e);
      alert("Failed to toggle notifications. Are you running a production build? Service workers are disabled in dev mode.");
    } finally {
      setLoading(false);
    }
  };

  const isEnabled = isSubscribed && permission === 'granted';

  return (
    <div className="bg-[#0E121A] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={15} className="text-blue-400" />
        <h3 className="text-sm font-bold text-white">Notifications</h3>
      </div>

      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
          Status
        </p>
        <div className="flex items-center gap-2">
           {permission === 'denied' ? (
             <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-red-500/10 border-red-500/20 text-red-500">
               Blocked by Browser
             </span>
           ) : isEnabled ? (
             <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-blue-500/10 border-blue-500/20 text-blue-400">
               Active
             </span>
           ) : (
             <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-white/5 border-white/10 text-zinc-500">
               Disabled
             </span>
           )}
        </div>
        
        {permission === 'denied' && (
          <p className="text-xs text-zinc-400 mt-3">
            Please click the lock icon next to the URL bar to reset notification permissions.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          {isEnabled ? <Bell size={14} className="text-zinc-400" /> : <BellOff size={14} className="text-zinc-400" />}
          <p className="text-xs text-zinc-400 font-medium">Push Notifications</p>
        </div>
        <button
          onClick={handleToggle}
          disabled={loading || permission === 'denied'}
          className={`relative w-10 h-5 rounded-full transition-all duration-300 disabled:opacity-50 ${
            isEnabled ? 'bg-blue-500' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
              isEnabled ? 'left-5' : 'left-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

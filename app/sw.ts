/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { type PrecacheEntry, Serwist, StaleWhileRevalidate, CacheFirst, ExpirationPlugin, RangeRequestsPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    // 1. Cache SawaFlix Content API Requests (Stale While Revalidate)
    // This allows instant UI loading from cache while fetching fresh data
    {
      matcher: ({ url }) => url.pathname.startsWith('/api/content') || (url.pathname.startsWith('/api/videos') && !url.pathname.includes('/api/videos/proxy')),
      handler: new StaleWhileRevalidate({
        cacheName: 'sawaflix-api-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
        ],
      }),
    },
    // 2. Cache External Images and Thumbnails (Cache First)
    {
      matcher: ({ url }) =>
        url.hostname.includes('ytimg.com') ||
        url.hostname.includes('ibb.co') ||
        url.hostname.includes('sanity.io') ||
        (url.hostname.includes('supabase.co') && !url.pathname.match(/\.(mp4|webm)$/i) && !url.pathname.includes('/videos/')),
      handler: new CacheFirst({
        cacheName: 'sawaflix-image-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          }),
        ],
      }),
    },
    // 3. TikTok-Style Video Pre-Cache (Cache First + Range Requests)
    // Targets the new Heavy Backend Proxy. This proxy downloads YouTube streams
    // and correctly pipes them as real MP4 buffers with 206 Partial Content headers.
    // RangeRequestsPlugin is highly critical here so the HTML5 Video/ReactPlayer
    // doesn't break when scrubbing backwards or skipping chunks.
    {
      matcher: ({ url }) =>
        url.pathname.includes('/api/videos/proxy') || // Primary backend MP4 proxy
        url.hostname.includes('youtube.com') ||
        url.hostname.includes('googlevideo.com') ||    // Fallback best-effort for iframes
        (url.hostname.includes('supabase.co') && (url.pathname.match(/\.(mp4|webm)$/i) || url.pathname.includes('/videos/'))),
      method: 'GET',
      handler: new CacheFirst({
        cacheName: 'sawaflix-video-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days — auto-rotate stale videos
            purgeOnQuotaError: true, // Auto-evict if device storage is full
          }),
          new RangeRequestsPlugin(), // << CRITICAL for MP4 chunking support
        ],
      }),
    },
  ],
});

serwist.addEventListeners();

// --- Web Push Notification Listeners ---

self.addEventListener('push', function (event: PushEvent) {
  if (event.data) {
    try {
      const data = event.data.json();

      const options: NotificationOptions = {
        body: data.body || data.message || 'New update on SawaFlix',
        icon: data.icon || '/logos_and_pwas/android-chrome-192x192.png',
        badge: '/logos_and_pwas/favicon-32x32.png',
        image: data.image || data.thumbnail || undefined,
        data: { url: data.url || '/dashboard' },
        vibrate: [200, 100, 200],
        tag: data.id || 'sawaflix-notification',
      };

      event.waitUntil(self.registration.showNotification(data.title || 'SawaFlix', options));
    } catch (e) {
      console.error('Error handling push event:', e);
    }
  }
});

self.addEventListener('notificationclick', function (event: NotificationEvent) {
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client && 'url' in client && client.url.includes(self.location.origin)) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

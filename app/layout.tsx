import './globals.css';
import type { Metadata, Viewport } from 'next';
import { AdminNotificationProvider } from '../contexts/AdminNotificationContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import NextTopLoader from 'nextjs-toploader';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import PWASplashScreen from '@/components/PWASplashScreen';
import NotificationPrompt from '@/components/NotificationPrompt';
import GoogleAuthProvider from '@/components/providers/GoogleAuthProvider';

export const metadata: Metadata = {
  metadataBase: new URL('https://sawaflix.com'),
  title: {
    default: 'Sawaflix | Cameroonn Music, Culture & Entertainment',
    template: '%s | Sawaflix',
  },
  description:
    'Sawaflix is your premium gateway to authentic Cameroonn music, Sawa heritage, and contemporary culture. Stream the best of Cameroonn entertainment, traditions, and artistic expression from across the continent.',
  keywords: [
    'Sawaflix',
    'Cameroonn music streaming',
    'Sawa culture',
    'Douala heritage',
    'Wouri traditions',
    'Cameroonn cinema',
    'Cameroon music',
    'Cameroonn traditions',
    'cultural entertainment',
    'Cameroonn artists hub',
    'Fonyuy Gita',
    'Mazehwo John Brindi',
    'Ngam Sabastine',
    'Wohking',
    'Asime Domitila',
    'Victory Beleh',
    'Kingsley',
  ],
  authors: [
    { name: 'Fonyuy Gita', url: 'https://github.com/iws3' },
    { name: 'Mazehwo John Brindi' },
    { name: 'Ngam Sabastine' },
    { name: 'Wohking' },
    { name: 'Asime Domitila' },
    { name: 'Victory Beleh' },
    { name: 'Kingsley' }
  ],
  creator: 'Sawaflix Dev Team',
  publisher: 'Sawaflix',
  openGraph: {
    url: 'https://sawaflix.com',
    type: 'website',
    title: 'Sawaflix | Discover Authentic Cameroonn Music & Culture',
    description:
      'Stream authentic Cameroonn music, traditions, and cultural content. Experience the pulse of Cameroon through Sawaflix.',
    siteName: 'Sawaflix',
    images: [
      {
        url: 'https://i.ibb.co/27LNPd8v/sawaflixmusic-cover.png',
        width: 1200,
        height: 630,
        alt: 'Sawaflix - The Pulse of Cameroonn Culture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sawaflix | Stream Cameroonn Music & Culture',
    description:
      'Discover authentic Cameroonn music, traditions, and cultural entertainment on Sawaflix.',
    creator: '@sawaflix',
    images: ['https://i.ibb.co/27LNPd8v/sawaflixmusic-cover.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/logos_and_pwas/favicon.ico' },
      { url: '/logos_and_pwas/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logos_and_pwas/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/logos_and_pwas/favicon.ico',
    apple: [
      { url: '/logos_and_pwas/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
  category: 'entertainment',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'sawaFlix',
  },
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://i.ibb.co" />
        <link rel="dns-prefetch" href="https://i.ibb.co" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logos_and_pwas/apple-touch-icon.png" />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="background-color" content="#FFFFFF" />
        <meta name="msapplication-navbutton-color" content="#FFFFFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script dangerouslySetInnerHTML={{
          __html: `
            window.deferredPrompt = null;
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              window.deferredPrompt = e;
            });
          `
        }} />
      </head>
      <body suppressHydrationWarning>
        {/* Instant Native PWA White Splash Screen with dark "sawaFlix" label */}
        <div id="pwa-native-splash" style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          transition: 'opacity 0.4s ease-out, visibility 0.4s ease-out',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '22px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              border: '1px solid #f4f4f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              overflow: 'hidden'
            }}>
              <img src="/logos_and_pwas/android-chrome-192x192.png" alt="sawaFlix" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textAlign: 'center' }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: '#0B0E14', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                sawaFlix
              </span>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.25em' }}>
                Authentic Culture &amp; Entertainment
              </span>
            </div>
            <div style={{ width: '96px', height: '3px', backgroundColor: '#f4f4f5', borderRadius: '9999px', overflow: 'hidden', marginTop: '8px' }}>
              <div style={{ width: '50%', height: '100%', backgroundColor: '#0B0E14', borderRadius: '9999px', animation: 'pwaSplashPulse 1.2s infinite ease-in-out' }} />
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pwaSplashPulse {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          #nprogress .bar {
            background: linear-gradient(90deg, #009639, #CE1126, #FCD116) !important;
          }
          #nprogress .peg {
            box-shadow: 0 0 10px #FCD116, 0 0 5px #FCD116 !important;
          }
        `}} />

        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              function hideSplash() {
                var splash = document.getElementById('pwa-native-splash');
                if (splash) {
                  splash.style.opacity = '0';
                  splash.style.pointerEvents = 'none';
                  setTimeout(function() {
                    if (splash && splash.parentNode) {
                      splash.parentNode.removeChild(splash);
                    }
                  }, 450);
                }
              }
              if (document.readyState === 'complete') {
                setTimeout(hideSplash, 600);
              } else {
                window.addEventListener('load', function() {
                  setTimeout(hideSplash, 600);
                });
              }
            })();
          `
        }} />

        <NextTopLoader color="transparent" showSpinner={false} />
        <GoogleAuthProvider>
          <AdminNotificationProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </AdminNotificationProvider>
          <PWAInstallPrompt />
          <NotificationPrompt />
        </GoogleAuthProvider>
      </body>
    </html>
  )
}
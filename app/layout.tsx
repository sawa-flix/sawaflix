import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AdminNotificationProvider } from '../contexts/AdminNotificationContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#D4AF37',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://sawaflixplay.vercel.app'),
  title: {
    default: 'Sawaflix | African Music, Culture & Entertainment',
    template: '%s | Sawaflix',
  },
  description:
    'Sawaflix is your gateway to authentic African music, traditions, and cultural content. Stream the best of African entertainment from across the continent. Discover artists, traditions, and stories that celebrate African culture.',
  keywords: [
    'Sawaflix',
    'African music',
    'African culture',
    'streaming',
    'entertainment',
    'traditional music',
    'African artists',
    'cultural content',
    'music streaming',
    'African traditions',
    'world music',
    'ethnic music',
    'African heritage',
    'music discovery',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sawaflix',
  },
  icons: {
    icon: [
      { url: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192x192.png',
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    url: 'https://sawaflixplay.vercel.app',
    type: 'website',
    title: 'Sawaflix | Discover Authentic African Music & Culture',
    description:
      'Stream authentic African music, traditions, and cultural content from across the continent. Discover the best of African entertainment on Sawaflix - your gateway to African heritage and modern culture.',
    siteName: 'Sawaflix',
    images: [
      {
        url: 'https://i.ibb.co/4HC007J/image.png',
        width: 1200,
        height: 630,
        alt: 'Sawaflix - African Music & Culture',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sawaflix | Stream African Music & Culture',
    description:
      'Discover authentic African music, traditions, and cultural entertainment. Stream the best of African culture on Sawaflix.',
    creator: '@sawaflix',
    site: '@sawaflix',
    images: ['https://i.ibb.co/4HC007J/image.png'],
  },
  alternates: {
    canonical: 'https://sawaflixplay.vercel.app',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <AdminNotificationProvider>
          {children}
        </AdminNotificationProvider>
        
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
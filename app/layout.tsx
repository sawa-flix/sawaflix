import './globals.css';
import type { Metadata } from 'next';
import { AdminNotificationProvider } from '../contexts/AdminNotificationContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://sawaflix.com'),
  title: {
    default: 'Sawaflix | African Music, Culture & Entertainment',
    template: '%s | Sawaflix',
  },
  description:
    'Sawaflix is your premium gateway to authentic African music, Sawa heritage, and contemporary culture. Stream the best of African entertainment, traditions, and artistic expression from across the continent.',
  keywords: [
    'Sawaflix',
    'African music streaming',
    'Sawa culture',
    'Douala heritage',
    'Wouri traditions',
    'African cinema',
    'African music',
    'African traditions',
    'cultural entertainment',
    'African artists hub',
    'Fonyuy Gita',
    'Mazehwo John Brindi',
    'Ngam Sabastine',
    'Wohking',
    'Asime Domitila',
    'Victory Beleh',
    'Kingsley',
  ],
  authors: [
    { name: 'Fonyuy Gita', url: 'https://github.com/Fonyuygita' },
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
    title: 'Sawaflix | Discover Authentic African Music & Culture',
    description:
      'Stream authentic African music, traditions, and cultural content. Experience the pulse of Africa through Sawaflix.',
    siteName: 'Sawaflix',
    images: [
      {
        url: 'https://i.ibb.co/27LNPd8v/sawaflixmusic-cover.png',
        width: 1200,
        height: 630,
        alt: 'Sawaflix - The Pulse of African Culture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sawaflix | Stream African Music & Culture',
    description:
      'Discover authentic African music, traditions, and cultural entertainment on Sawaflix.',
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
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  category: 'entertainment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://i.ibb.co" />
        <link rel="dns-prefetch" href="https://i.ibb.co" />
      </head>
      <body suppressHydrationWarning>
        <AdminNotificationProvider>
          {children}
        </AdminNotificationProvider>
      </body>
    </html>
  )
}
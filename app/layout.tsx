import './globals.css';
import { Inter } from 'next/font/google';
import { AdminNotificationProvider } from '../contexts/AdminNotificationContext';
import { defaultMetadata } from '../lib/metadata';

const inter = Inter({ subsets: ['latin'] });

export const metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta property="og:image" content="https://i.ibb.co/4HC007J/image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta name="twitter:image" content="https://i.ibb.co/4HC007J/image.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AdminNotificationProvider>
          {children}
        </AdminNotificationProvider>
      </body>
    </html>
  )
}
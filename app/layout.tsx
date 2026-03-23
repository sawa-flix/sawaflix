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
      <body className={inter.className} suppressHydrationWarning>
        <AdminNotificationProvider>
          {children}
        </AdminNotificationProvider>
      </body>
    </html>
  )
}
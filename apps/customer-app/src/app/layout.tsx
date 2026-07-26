import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quicko - Quick Grocery Delivery',
  description: '10-30 minute delivery from local stores',
  manifest: '/manifest.json',
  themeColor: '#22c55e',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Quicko',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

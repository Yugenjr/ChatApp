import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Private Chat',
  description: 'A private 1-on-1 realtime chat application',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0f0f0f" />
        <meta name="apple-mobile-web-app-capable" content="true" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Private Chat" />
      </head>
      <body className="bg-dark-bg text-white">{children}</body>
    </html>
  );
}

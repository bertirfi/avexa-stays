import type { Metadata, Viewport } from 'next';
import { jakarta, manrope, dmMono } from '@/lib/fonts';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ChromeScrollProvider } from '@/components/chrome/ChromeScrollProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AVEXA Stays — Live the city.',
    template: '%s · AVEXA Stays',
  },
  description:
    'Premium short and medium-stay apartments in the heart of Bucharest. Booked direct, kept honest.',
  metadataBase: new URL('https://avexastays.com'),
  openGraph: {
    title: 'AVEXA Stays — Live the city.',
    description:
      'Premium short and medium-stay apartments in the heart of Bucharest. Booked direct, kept honest.',
    url: 'https://avexastays.com',
    siteName: 'AVEXA Stays',
    type: 'website',
    locale: 'en_US',
  },
};

export const viewport: Viewport = {
  themeColor: '#191919',
  width: 'device-width',
  initialScale: 1,
  // App-like, stable mobile: no accidental zoom on input focus / double-tap.
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${manrope.variable} ${dmMono.variable}`}
    >
      <body className="font-body antialiased">
        <AuthProvider>
          <ChromeScrollProvider>{children}</ChromeScrollProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

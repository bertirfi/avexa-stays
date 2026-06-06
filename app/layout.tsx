import type { Metadata, Viewport } from 'next';
import { jakarta, manrope, dmMono } from '@/lib/fonts';
import { DemoModeToggle } from '@/components/DemoModeToggle';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AVEXA Stays — Live the city.',
    template: '%s · AVEXA Stays',
  },
  description:
    'Premium short and medium-stay apartments in the heart of Bucharest. Booked direct, kept honest.',
  metadataBase: new URL('https://avexastays.com'),
};

export const viewport: Viewport = {
  themeColor: '#191919',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${manrope.variable} ${dmMono.variable}`}
    >
      <body className="font-body antialiased">
        {children}
        <DemoModeToggle />
      </body>
    </html>
  );
}

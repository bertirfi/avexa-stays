import type { Metadata, Viewport } from 'next';
import { jakarta, manrope, dmMono } from '@/lib/fonts';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ConsentProvider } from '@/components/consent/ConsentProvider';
import { ConsentBanner } from '@/components/consent/ConsentBanner';
import { ChromeScrollProvider } from '@/components/chrome/ChromeScrollProvider';
import { CurrencyProvider } from '@/components/currency/CurrencyProvider';
import { SearchProvider } from '@/components/search/SearchContext';
import { getDisplayRates } from '@/lib/pricing';
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
  // Pinch-zoom stays enabled (accessibility + client decision 24.08) — never
  // set maximumScale/userScalable here.
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
          {/* GDPR consent state (transparency + future analytics gating); banner mounts below. */}
          <ConsentProvider>
            {/* Display rates come from server env — RON stays the money of record. */}
            <CurrencyProvider rates={getDisplayRates()}>
              <ChromeScrollProvider>
                {/* One shared search state for the Nav header pill + all pages. */}
                <SearchProvider>{children}</SearchProvider>
              </ChromeScrollProvider>
            </CurrencyProvider>
            <ConsentBanner />
          </ConsentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

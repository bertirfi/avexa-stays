import { Plus_Jakarta_Sans, Manrope, DM_Mono } from 'next/font/google';

export const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

// Variable font (no weight list) so body copy can sit at 450 — halfway
// between regular and medium, per the client's readability request 24.08.
export const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});

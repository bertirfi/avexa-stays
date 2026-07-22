import { ImageResponse } from 'next/og';

// Default social card for every route without its own image.
// Rendered at build via Satori — no external font fetch (keeps build offline-safe).
export const alt = 'AVEXA Stays — Bucharest City Center Apartments';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#191919',
          backgroundImage:
            'radial-gradient(ellipse 60% 50% at 28% 38%, rgba(221,185,122,0.20), transparent), radial-gradient(ellipse 55% 60% at 82% 72%, rgba(176,136,64,0.14), transparent)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 132,
            fontWeight: 700,
            letterSpacing: '0.07em',
            color: '#DDB97A',
          }}
        >
          AVEXA
        </div>
        <div
          style={{
            display: 'flex',
            width: 120,
            height: 2,
            backgroundColor: '#B08840',
            margin: '30px 0',
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: 33,
            letterSpacing: '0.2em',
            color: '#FAF9F5',
          }}
        >
          BUCHAREST CITY CENTER APARTMENTS
        </div>
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 48,
            fontSize: 22,
            letterSpacing: '0.1em',
            color: 'rgba(250,249,245,0.5)',
          }}
        >
          avexastays.com
        </div>
      </div>
    ),
    { ...size },
  );
}

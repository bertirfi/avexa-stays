'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/cn';

const panels = [
  {
    eyebrow: '01',
    title: 'Book',
    body: 'Pick a stay, pick your dates. Members unlock our best rate the moment they sign in — no codes, no haggling.',
    image: '/listing-photos/00-cover.jpeg',
  },
  {
    eyebrow: '02',
    title: 'Check-in',
    body: 'Self-arrival or a real human at the door. Door codes land in your inbox the morning of check-in.',
    image: '/listing-photos/09-hallway.jpeg',
  },
  {
    eyebrow: '03',
    title: 'Explore',
    body: 'A local guide curated by our team — neighborhood walks, restaurants we actually eat at, the bakery worth queuing for.',
    image: '/listing-photos/33-open-streets.jpeg',
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);

  return (
    <section id="how" className="bg-ink py-24 text-cream md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal direction="up">
          <p className="font-mono-label mb-3 text-gold">How it works</p>
          <h2 className="font-display text-4xl md:text-6xl">Three steps. No catch.</h2>
        </Reveal>

        <div className="mt-16 flex h-[480px] gap-3 overflow-hidden rounded-card">
          {panels.map((p, i) => {
            const isActive = i === active;
            return (
              <button
                type="button"
                key={p.title}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                className={cn(
                  'relative overflow-hidden rounded-card text-left transition-all duration-700 ease-[var(--ease-snap)]',
                  isActive ? 'flex-[2]' : 'flex-[0.4]',
                )}
              >
                <Image
                  src={p.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className={cn(
                    'object-cover transition-all duration-700',
                    isActive ? 'opacity-100 scale-100' : 'opacity-50 scale-110',
                  )}
                />
                <div
                  className={cn(
                    'absolute inset-0 transition',
                    isActive ? 'bg-ink/30' : 'bg-ink/70',
                  )}
                />
                <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10">
                  <p className="font-mono-label text-gold">{p.eyebrow}</p>
                  <div>
                    <h3
                      className={cn(
                        'font-display transition-all',
                        isActive ? 'text-5xl md:text-7xl' : 'text-3xl md:text-4xl',
                      )}
                    >
                      {p.title}
                    </h3>
                    <p
                      className={cn(
                        'mt-4 max-w-md text-cream/80 transition-opacity duration-500',
                        isActive ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      {p.body}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

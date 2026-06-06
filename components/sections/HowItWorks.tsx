'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/cn';

const panels = [
  {
    eyebrow: '01',
    title: 'Book in 2 minutes',
    body: 'Skip the platforms. Book your Bucharest city center space directly, get our lowest guaranteed rate, and lock it in before someone else does.',
    image: '/listing-photos/00-cover.jpeg',
  },
  {
    eyebrow: '02',
    title: 'Digital Check-in',
    body: 'No lobby. No waiting. Verify your ID from your phone and receive your unique access code exactly 24 hours before you arrive in Bucharest city center.',
    image: '/listing-photos/09-hallway.jpeg',
  },
  {
    eyebrow: '03',
    title: 'Enter & Explore',
    body: 'Your Bucharest city center door opens. Lights calibrated. Linens pressed. Temperature set. The space is ready. The city is next.',
    image: '/listing-photos/33-open-streets.jpeg',
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);

  return (
    <section id="how" className="bg-ink py-24 text-cream md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal direction="up">
          <p className="font-mono-label mb-3 text-gold">— HOW AVEXA WORKS</p>
          <h2 className="font-display max-w-[900px] text-4xl md:text-6xl">
            Three steps to your Bucharest city center apartment.
          </h2>
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

        <Reveal direction="up">
          <p className="mt-12 max-w-[520px] font-semibold text-cream/80">
            Everything from booking to departure happens on your phone. No queue, no paperwork, no handover calls.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

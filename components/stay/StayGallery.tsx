'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import type { PropertyPhoto } from '@/types';

interface StayGalleryProps {
  photos: PropertyPhoto[];
  name: string;
}

export function StayGallery({ photos, name }: StayGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const swipeStartX = useRef<number | null>(null);
  const swiped = useRef(false);
  const visible = photos.slice(0, 5);

  const step = useCallback(
    (dir: -1 | 1) =>
      setOpenIndex((i) => (i === null ? null : Math.min(photos.length - 1, Math.max(0, i + dir)))),
    [photos.length],
  );

  // ponytail: pointer events, no motion lib — lightbox has no slide animation to respect reduced motion for
  function onPointerUp(e: React.PointerEvent) {
    if (swipeStartX.current === null) return;
    const dx = e.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(dx) < 50) return;
    swiped.current = true;
    step(dx < 0 ? 1 : -1);
  }

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenIndex(null);
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    }
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, step]);

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-card aspect-[2.2/1] max-sm:grid-cols-1 max-sm:grid-rows-1 max-sm:aspect-[4/3]">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="relative col-span-2 row-span-2 overflow-hidden max-sm:col-span-1 max-sm:row-span-1"
        >
          {visible[0] && (
            <Image
              src={visible[0].src}
              alt={`${name} — ${visible[0].label}`}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition duration-500 hover:scale-105"
            />
          )}
          {/* Mobile-only pill — hidden on sm+ */}
          <span
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex(0);
            }}
            className="absolute right-4 bottom-4 hidden max-sm:flex items-center gap-1 rounded-[10px] border border-gray-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-md"
          >
            <Icon name="grid" size={14} /> Show all {photos.length} photos
          </span>
        </button>
        {visible.slice(1).map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setOpenIndex(i + 1)}
            className="relative overflow-hidden max-sm:hidden"
          >
            <Image
              src={p.src}
              alt={`${name} — ${p.label}`}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition duration-500 hover:scale-105"
            />
            {i === 3 && photos.length > 5 && (
              <span className="absolute right-4 bottom-4 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-ink shadow-md">
                <Icon name="grid" size={14} className="mr-1 inline" /> Show all {photos.length} photos
              </span>
            )}
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-[80] flex touch-pan-y touch-pinch-zoom select-none items-center justify-center bg-ink/95 p-6"
          onPointerDown={(e) => {
            swipeStartX.current = e.clientX;
            swiped.current = false;
          }}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            swipeStartX.current = null;
          }}
          onClickCapture={(e) => {
            if (!swiped.current) return;
            swiped.current = false;
            e.stopPropagation();
          }}
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-6 top-6 z-10 grid size-12 place-items-center rounded-full bg-white/10 text-cream backdrop-blur hover:bg-white/20"
            onClick={() => setOpenIndex(null)}
          >
            <Icon name="x" size={20} />
          </button>

          {openIndex > 0 && (
            <button
              type="button"
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="absolute left-4 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-cream backdrop-blur hover:bg-white/20"
            >
              <Icon name="chevLeft" size={20} />
            </button>
          )}

          <Image
            src={photos[openIndex].src}
            alt={`${name} — ${photos[openIndex].label}`}
            width={1600}
            height={1067}
            sizes="92vw"
            className="h-auto max-h-[85vh] w-auto max-w-[92vw] object-contain"
            priority
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          />

          {openIndex < photos.length - 1 && (
            <button
              type="button"
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className="absolute right-4 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-cream backdrop-blur hover:bg-white/20"
            >
              <Icon name="chevRight" size={20} />
            </button>
          )}

          <span className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 font-mono-label text-cream backdrop-blur">
            {openIndex + 1} / {photos.length}
          </span>
        </div>
      )}
    </>
  );
}

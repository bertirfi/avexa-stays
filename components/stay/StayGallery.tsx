'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import type { PropertyPhoto } from '@/types';

interface StayGalleryProps {
  photos: PropertyPhoto[];
  name: string;
}

export function StayGallery({ photos, name }: StayGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const visible = photos.slice(0, 5);

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenIndex(null);
      if (e.key === 'ArrowLeft') setOpenIndex((i) => (i === null ? null : Math.max(0, i - 1)));
      if (e.key === 'ArrowRight')
        setOpenIndex((i) => (i === null ? null : Math.min(photos.length - 1, i + 1)));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIndex, photos.length]);

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-card aspect-[2.2/1]">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="relative col-span-2 row-span-2 overflow-hidden"
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
        </button>
        {visible.slice(1).map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setOpenIndex(i + 1)}
            className="relative overflow-hidden"
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
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 p-6"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-6 top-6 grid size-12 place-items-center rounded-full bg-white/10 text-cream backdrop-blur hover:bg-white/20"
            onClick={() => setOpenIndex(null)}
          >
            <Icon name="x" size={20} />
          </button>

          <button
            type="button"
            aria-label="Previous"
            disabled={openIndex === 0}
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex((i) => Math.max(0, (i ?? 0) - 1));
            }}
            className="absolute left-6 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-cream backdrop-blur hover:bg-white/20 disabled:opacity-30"
          >
            <Icon name="chevLeft" size={20} />
          </button>

          <div
            className="relative h-full max-h-[80vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[openIndex].src}
              alt={`${name} — ${photos[openIndex].label}`}
              fill
              sizes="80vw"
              className="object-contain"
              priority
            />
          </div>

          <button
            type="button"
            aria-label="Next"
            disabled={openIndex === photos.length - 1}
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex((i) => Math.min(photos.length - 1, (i ?? 0) + 1));
            }}
            className="absolute right-6 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-cream backdrop-blur hover:bg-white/20 disabled:opacity-30"
          >
            <Icon name="chevRight" size={20} />
          </button>

          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 font-mono-label text-cream backdrop-blur">
            {openIndex + 1} / {photos.length}
          </span>
        </div>
      )}
    </>
  );
}

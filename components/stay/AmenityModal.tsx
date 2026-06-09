'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from '@/components/Icon';
import type { CategorizedAmenities, Property } from '@/types';
import { cn } from '@/lib/cn';

const AVEXA_STANDARD = [
  '24/7 online reception',
  'High-speed Wi-Fi',
  'Contactless check-in',
  'Free tea and coffee',
  'Shampoo and body soap',
];

interface AmenityModalProps {
  open: boolean;
  onClose: () => void;
  property: Property;
}

export function AmenityModal({ open, onClose, property }: AmenityModalProps) {
  const [tab, setTab] = useState<'property' | 'room'>('property');

  // Lock scroll + Escape to close while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const bedLabel = property.stats.find((s) => s.icon === 'bed')?.label ?? '';
  const data: CategorizedAmenities =
    tab === 'property' ? property.amenitiesProperty : property.amenitiesRoom;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] bg-ink/50"
            onClick={onClose}
            aria-hidden
          />

          {/* Centered (desktop) / full-screen (mobile) container */}
          <div
            className="fixed inset-0 z-[201] flex items-stretch justify-center sm:items-center sm:p-4"
            onClick={onClose}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="All amenities"
              initial={{ opacity: 0, y: 48, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 48, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex w-full flex-col bg-white max-sm:h-screen max-sm:max-h-screen max-sm:rounded-none sm:max-h-[85vh] sm:w-[min(700px,92vw)] sm:rounded-[20px]"
            >
              {/* Header */}
              <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-line px-6 py-5 sm:px-7">
                <h3 className="font-display text-xl">All Amenities</h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="grid size-8 place-items-center rounded-full bg-gray-light text-ink transition hover:bg-gray-line"
                >
                  <Icon name="x" size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-7">
                {/* Tabs */}
                <div className="mb-5 flex">
                  <button
                    type="button"
                    onClick={() => setTab('property')}
                    className={cn(
                      'flex-1 rounded-l-[10px] border border-gray-line py-3 text-sm font-semibold transition',
                      tab === 'property' ? 'border-ink bg-ink text-white' : 'bg-white text-ink',
                    )}
                  >
                    Property Amenities
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('room')}
                    className={cn(
                      '-ml-px flex-1 rounded-r-[10px] border border-gray-line py-3 text-sm font-semibold transition',
                      tab === 'room' ? 'border-ink bg-ink text-white' : 'bg-white text-ink',
                    )}
                  >
                    Room Amenities
                  </button>
                </div>

                {/* Room subtitle */}
                {tab === 'room' && (
                  <p className="mb-4 text-[13px] text-ink-60">
                    <strong className="font-semibold text-ink">
                      {bedLabel ? `${bedLabel} · ` : ''}
                      {property.subtitle}
                    </strong>
                    <br />
                    The available amenities may differ based on the room type.
                  </p>
                )}

                {/* 3-column category grid */}
                <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(data).map(([cat, items]) => (
                    <div key={cat}>
                      <h4 className="font-display border-b border-gray-line pb-2 text-[15px] font-bold">
                        {cat}
                      </h4>
                      <div className="mt-2">
                        {items.map((item) => (
                          <div key={item} className="flex items-start gap-2 py-[5px] text-sm text-ink">
                            <Icon name="check" size={16} strokeWidth={1.6} className="mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* AVEXA Standard box */}
                <div className="mt-7 rounded-xl bg-cream p-[18px]">
                  <h4 className="mb-2.5 flex items-center gap-1.5 text-sm font-bold">
                    <Icon name="info" size={16} className="text-gold-dark" />
                    AVEXA Standard Amenities
                  </h4>
                  <ul className="space-y-1">
                    {AVEXA_STANDARD.map((s) => (
                      <li key={s} className="flex items-center gap-1.5 text-[13px] text-ink-80">
                        <span className="font-bold text-[#2E7D32]">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

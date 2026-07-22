'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { AmenityModal } from '@/components/stay/AmenityModal';
import type { Property } from '@/types';

export function StayAmenities({ property }: { property: Property }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="border-b border-gray-line py-10">
      <h2 className="font-display mb-4 text-2xl">Room amenities</h2>

      <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
        {property.amenitiesTop.map((a) => (
          <div key={a} className="flex items-center gap-3 py-3 text-base text-ink">
            <Icon name="check" size={20} strokeWidth={1.6} className="shrink-0" />
            {a}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 rounded-[10px] border-[1.5px] border-ink bg-white px-7 py-4 text-base font-semibold transition hover:bg-ink hover:text-white"
      >
        Show all amenities
      </button>

      <AmenityModal open={open} onClose={() => setOpen(false)} property={property} />
    </section>
  );
}

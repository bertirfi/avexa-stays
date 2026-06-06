import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { properties } from '@/lib/properties';

/**
 * Five real suites mapped onto the source's 5-tile mosaic.
 * Source positions (my-trips.html ~228-241):
 *   tile 1 → col 1 / row 1        tile 4 → col 1 / row 2
 *   tile 2 → col 2 / row 1        tile 5 → col 2-4 / row 2 (wide)
 *   tile 3 → col 3 / row 1
 */
const mosaicIds = ['101', '202', '201', '203', '301'] as const;

const tiles = mosaicIds
  .map((id) => properties.find((p) => p.id === id))
  .filter((p): p is NonNullable<typeof p> => Boolean(p));

// Explicit placement at both breakpoints, mirroring the source CSS.
// Phone (2col × 3row): tile3 spans full width on row 2.
// Tablet/desktop (3col × 2row): tile5 spans cols 2-4 on row 2.
const positions = [
  'col-start-1 row-start-1 sm:col-start-1 sm:col-end-2 sm:row-start-1',
  'col-start-2 row-start-1 sm:col-start-2 sm:col-end-3 sm:row-start-1',
  'col-start-1 col-end-3 row-start-2 sm:col-start-3 sm:col-end-4 sm:row-start-1',
  'col-start-1 row-start-3 sm:col-start-1 sm:col-end-2 sm:row-start-2',
  'col-start-2 row-start-3 sm:col-start-2 sm:col-end-4 sm:row-start-2',
];

const delays = [0, 0.12, 0.24, 0.36, 0.48];

const sizes = [
  '(max-width: 640px) 50vw, (max-width: 980px) 33vw, 420px',
  '(max-width: 640px) 50vw, (max-width: 980px) 33vw, 420px',
  '(max-width: 640px) 100vw, (max-width: 980px) 33vw, 420px',
  '(max-width: 640px) 50vw, (max-width: 980px) 33vw, 420px',
  '(max-width: 640px) 50vw, (max-width: 980px) 66vw, 840px',
];

export function MosaicSection() {
  return (
    <section className="bg-white py-[clamp(90px,11vw,150px)]">
      <div className="mx-auto max-w-[1300px] px-4 md:px-6 lg:px-10">
        <Reveal direction="up" className="mb-9 max-w-[700px] md:mb-14">
          <h2 className="font-display text-[clamp(44px,6.2vw,80px)] leading-none">
            A taste of what&apos;s waiting
            <span
              aria-hidden
              className="ml-[0.08em] inline-block size-[0.14em] translate-y-[0.04em] rounded-full bg-gold-dark align-baseline pulse-dot"
            />
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 grid-rows-[180px_180px_180px] gap-2.5 sm:grid-cols-3 sm:grid-rows-[260px_260px] sm:gap-4">
          {tiles.map((property, i) => (
            <Reveal
              key={property.id}
              direction="up"
              delay={delays[i]}
              className={positions[i]}
            >
              <Link
                href={`/stays/${property.slug}`}
                className="group relative block h-full overflow-hidden rounded-[18px] transition-[transform,box-shadow] duration-[400ms] ease-[var(--ease-snap)] hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-20px_rgba(25,25,25,0.2)]"
              >
                <Image
                  src={property.cover}
                  alt={property.name}
                  fill
                  sizes={sizes[i]}
                  className="object-cover transition-transform duration-[600ms] ease-[var(--ease-snap)] group-hover:scale-105"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent"
                />
                <span className="font-mono-label absolute bottom-3.5 left-4 z-[2] text-white/70">
                  {property.name}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

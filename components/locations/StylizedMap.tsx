'use client';

import type { Property } from '@/types';
import { cn } from '@/lib/cn';

/** Decorative pin positions (% of map box), spread for legibility by zone. */
const PIN_POS: Record<string, { x: number; y: number }> = {
  '304': { x: 42, y: 22 }, // Piața Romană (north)
  '302': { x: 50, y: 38 }, // Calea Victoriei
  '303': { x: 61, y: 45 },
  '202': { x: 39, y: 49 },
  '301': { x: 52, y: 53 },
  '201': { x: 45, y: 65 }, // Old City Center
  '101': { x: 57, y: 69 },
  '203': { x: 67, y: 60 }, // Universitate
};

const ZONE_LABELS: Array<{ label: string; x: number; y: number }> = [
  { label: 'Piața Romană', x: 42, y: 14 },
  { label: 'Calea Victoriei', x: 56, y: 33 },
  { label: 'Universitate', x: 75, y: 56 },
  { label: 'Old City Center', x: 50, y: 80 },
];

interface StylizedMapProps {
  properties: Property[];
  activeId: string | null;
  onActivate: (id: string) => void;
  onClear: () => void;
}

export function StylizedMap({ properties, activeId, onActivate, onClear }: StylizedMapProps) {
  function onPinClick(id: string) {
    onActivate(id);
    // Desktop: scroll the matching card into view (the map only renders ≥ lg)
    const el = document.getElementById(`loc-card-${id}`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  return (
    <div className="relative m-3 ml-0 hidden overflow-hidden rounded-[20px] border-l border-gray-line bg-[#242824] lg:sticky lg:top-20 lg:block lg:h-[calc(100vh-5rem)]">
      {/* Base map gradient (parks + water) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 200px 120px at 22% 30%, rgba(60,120,55,.55), transparent 70%),' +
            'radial-gradient(ellipse 260px 160px at 78% 72%, rgba(60,120,55,.45), transparent 70%),' +
            'radial-gradient(ellipse 140px 100px at 60% 18%, rgba(60,120,55,.4), transparent 70%),' +
            'radial-gradient(ellipse 340px 90px at 12% 82%, rgba(60,100,140,.45), transparent 70%),' +
            'linear-gradient(180deg,#2e332d,#1f231e)',
        }}
      />

      {/* Street grid */}
      <svg className="absolute inset-0 h-full w-full opacity-55" preserveAspectRatio="none" viewBox="0 0 100 100">
        <g stroke="rgba(255,255,255,.08)" strokeWidth="0.3">
          {[15, 30, 45, 60, 75, 90].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} />
          ))}
          {[12, 28, 44, 60, 76, 92].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100" />
          ))}
        </g>
        <g stroke="rgba(255,255,255,.14)" strokeWidth="0.5">
          <line x1="0" y1="50" x2="100" y2="46" />
          <line x1="48" y1="0" x2="54" y2="100" />
        </g>
        <path d="M 5 88 Q 35 78 55 84 T 98 74" stroke="rgba(60,100,140,.5)" strokeWidth="1.2" fill="none" />
      </svg>

      {/* Zone labels */}
      {ZONE_LABELS.map((z) => (
        <span
          key={z.label}
          className="font-mono-label pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[10px] tracking-[0.24em] text-white/50"
          style={{ left: `${z.x}%`, top: `${z.y}%` }}
        >
          {z.label}
        </span>
      ))}

      {/* Pins */}
      {properties.map((p) => {
        const pos = PIN_POS[p.id];
        if (!pos) return null;
        const isActive = activeId === p.id;
        return (
          <button
            key={p.id}
            type="button"
            aria-label={`${p.name} — €${p.rates[0].perNight}/night`}
            onMouseEnter={() => onActivate(p.id)}
            onMouseLeave={onClear}
            onClick={() => onPinClick(p.id)}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: isActive ? 5 : 1 }}
          >
            <span
              className={cn(
                'relative flex items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] px-2.5 py-1.5 font-display text-[12.5px] font-bold transition-all duration-200',
                isActive
                  ? 'scale-[1.2] border-ink bg-gold text-ink shadow-[0_10px_28px_rgba(0,0,0,.5)]'
                  : 'border-transparent bg-white text-ink shadow-[0_4px_12px_rgba(0,0,0,.35)] hover:scale-105 hover:bg-gold',
              )}
            >
              <span className="size-1.5 rounded-full" style={{ background: p.neighborhoodColor }} />
              €{p.rates[0].perNight}
              <span
                aria-hidden
                className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-inherit"
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

'use client';

interface MobileBookingBarProps {
  priceLabel: string;
  priceValue: string;
  taxNote: string;
  ctaLabel: string;
  onBook: () => void;
}

export function MobileBookingBar({
  priceLabel,
  priceValue,
  taxNote,
  ctaLabel,
  onBook,
}: MobileBookingBarProps) {
  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 max-md:bottom-[calc(60px+env(safe-area-inset-bottom))] z-40 flex items-center justify-between border-t border-gray-line bg-white px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
      {/* Left: price badge */}
      <div className="flex flex-col">
        <span className="text-[11px] text-ink-60">{priceLabel}</span>
        <span className="rounded-[8px] border border-gold bg-gold-pale px-3 py-1.5 font-display text-base">
          {priceValue}
        </span>
        <span className="text-[11px] text-ink-60">{taxNote}</span>
      </div>

      {/* Right: CTA button */}
      <button
        type="button"
        onClick={onBook}
        className="rounded-[12px] bg-ink px-6 py-3.5 font-display text-[15px] font-bold text-cream"
      >
        {ctaLabel}
      </button>
    </div>
  );
}

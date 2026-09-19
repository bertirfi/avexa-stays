'use client';

import { Icon } from '@/components/Icon';
import { cn } from '@/lib/cn';

interface AddPillProps {
  added: boolean;
  /** Dark = on the ink surfaces (stay page), light = cream/white cards. */
  tone?: 'dark' | 'light';
  size?: 'sm' | 'md';
  /** Labels for the two states; defaults read "Add" / "Added". */
  labels?: { add: string; added: string };
  className?: string;
}

/**
 * The one "Add" control for extra services — identical on the stay page, in
 * the booking sidebar and in My Trips, so a selected service always looks the
 * same: gold fill + check. Unselected is a quiet outlined pill with a plus.
 */
export function AddPill({
  added,
  onToggle,
  tone = 'light',
  size = 'md',
  labels,
  className,
}: AddPillProps & { onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={added}
      onClick={onToggle}
      className={pillClass({ added, tone, size, className, hover: 'hover' })}
    >
      <PillContent added={added} size={size} labels={labels} />
    </button>
  );
}

/**
 * Same visual as AddPill, rendered as a <span> for rows that are themselves a
 * button (the whole row toggles; nested buttons are invalid HTML). Give the
 * row the `group` class so the badge lights up when the row is hovered.
 */
export function AddPillBadge({ added, tone = 'light', size = 'sm', labels, className }: AddPillProps) {
  return (
    <span aria-hidden className={pillClass({ added, tone, size, className, hover: 'group-hover' })}>
      <PillContent added={added} size={size} labels={labels} />
    </span>
  );
}

function PillContent({
  added,
  size,
  labels,
}: Pick<AddPillProps, 'added' | 'size' | 'labels'>) {
  return (
    <>
      <Icon name={added ? 'check' : 'plus'} size={size === 'sm' ? 13 : 15} strokeWidth={2.4} />
      {added ? (labels?.added ?? 'Added') : (labels?.add ?? 'Add')}
    </>
  );
}

function pillClass({
  added,
  tone,
  size,
  className,
  hover,
}: Required<Pick<AddPillProps, 'added' | 'tone' | 'size'>> & {
  className?: string;
  hover: 'hover' | 'group-hover';
}) {
  const h = hover;
  return cn(
    'inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-semibold transition',
    size === 'sm' ? 'h-8 px-3.5 text-xs' : 'h-10 px-5 text-sm',
    added
      ? cn('bg-gold text-ink shadow-[0_0_0_3px_rgba(221,185,122,0.25)]', h === 'hover' ? 'hover:bg-gold-pale' : 'group-hover:bg-gold-pale')
      : tone === 'dark'
        ? cn('border border-cream/30 text-cream', h === 'hover' ? 'hover:border-gold hover:text-gold' : 'group-hover:border-gold group-hover:text-gold')
        : cn('border border-ink/20 text-ink', h === 'hover' ? 'hover:border-gold-dark hover:text-gold-dark' : 'group-hover:border-gold-dark group-hover:text-gold-dark'),
    className,
  );
}

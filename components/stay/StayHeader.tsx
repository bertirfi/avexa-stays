import { Icon, type IconName } from '@/components/Icon';
import type { Property } from '@/types';

const iconMap: Record<string, IconName> = {
  users: 'users',
  bed: 'bed',
  sofa: 'sofa',
  bath: 'bath',
};

export function StayHeader({ property }: { property: Property }) {
  return (
    <header className="border-b border-gray-line pb-8">
      <span
        className="font-mono-label inline-flex items-center gap-2 text-ink-60"
        style={{ color: property.neighborhoodColor }}
      >
        <span
          aria-hidden
          className="size-2 rounded-full"
          style={{ background: property.neighborhoodColor }}
        />
        {property.neighborhoodLabel}
      </span>
      <h1 className="font-display mt-3 text-4xl md:text-5xl">{property.name}</h1>
      <p className="mt-2 text-base text-ink-60">{property.subtitle}</p>
      <p className="mt-3 font-display italic text-gold-dark">{property.tagline}</p>

      <ul className="mt-6 flex flex-wrap gap-5">
        {property.stats.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm text-ink-80">
            <Icon name={iconMap[s.icon] ?? 'info'} size={18} />
            {s.label}
          </li>
        ))}
      </ul>
    </header>
  );
}

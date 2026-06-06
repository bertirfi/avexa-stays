'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/Icon';
import { cn } from '@/lib/cn';

const tabs: Array<{ href: string; label: string; icon: IconName }> = [
  { href: '/', label: 'Search', icon: 'search' },
  { href: '/locations', label: 'Locations', icon: 'pin' },
  { href: '/my-trips', label: 'Trips', icon: 'calendar' },
  { href: '/profile', label: 'Profile', icon: 'user' },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-line bg-cream/95 backdrop-blur md:hidden"
      aria-label="Quick navigation"
    >
      <ul className="mx-auto flex max-w-md justify-around px-4 py-2">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition',
                  active ? 'text-gold-dark' : 'text-ink-60 hover:text-ink',
                )}
              >
                <Icon name={tab.icon} size={20} />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

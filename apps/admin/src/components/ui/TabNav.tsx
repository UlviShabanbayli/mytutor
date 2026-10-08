import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { cn } from '@/lib/cn';

type Tab = { to: string; label: string; icon?: ReactNode; badge?: ReactNode };

type TabNavProps = { label: string; tabs: Tab[] };

/** Route-backed tabs: each tab is a link, so the selected tab survives reloads and sharing. */
export function TabNav({ label, tabs }: TabNavProps) {
  return (
    <nav aria-label={label} className="flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          replace
          className={({ isActive }) =>
            cn(
              '-mb-px inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 font-sans-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )
          }
        >
          {tab.icon}
          {tab.label}
          {tab.badge}
        </NavLink>
      ))}
    </nav>
  );
}

import { CircleHelp, Library, ListChecks, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router';
import { useContentIndex } from '@/features/content/queries';
import { cn } from '@/lib/cn';

type NavItem = { to: string; label: string; icon: ReactNode; count?: number; active: boolean };

/** The panel's sections: a sidebar on wide screens, a scrollable row under the header otherwise. */
export function AppNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const index = useContentIndex();
  const under = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  const items: NavItem[] = [
    {
      to: '/',
      label: t('nav.books'),
      icon: <Library className="size-5" aria-hidden />,
      count: index.data?.books.length,
      active: pathname === '/' || under('/books'),
    },
    {
      to: '/curricula',
      label: t('nav.curricula'),
      icon: <ListChecks className="size-5" aria-hidden />,
      count: index.data?.curricula.length,
      active: under('/curricula'),
    },
    {
      to: '/trash',
      label: t('nav.trash'),
      icon: <Trash2 className="size-5" aria-hidden />,
      count: index.data?.trash.length,
      active: under('/trash'),
    },
    {
      to: '/guide',
      label: t('nav.guide'),
      icon: <CircleHelp className="size-5" aria-hidden />,
      active: under('/guide'),
    },
  ];

  return (
    <nav aria-label={t('nav.label')}>
      <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {items.map((item) => (
          <li key={item.to} className="shrink-0">
            <NavLink
              to={item.to}
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-md px-3 font-sans-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                item.active
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {item.icon}
              <span className="flex-1 whitespace-nowrap">{item.label}</span>
              {item.count ? (
                <span className="rounded-full bg-card px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                  {item.count}
                </span>
              ) : null}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

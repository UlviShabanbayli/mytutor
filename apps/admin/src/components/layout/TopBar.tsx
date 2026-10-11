import { ChevronRight, Menu } from 'lucide-react';
import { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useCrumbs } from '@/features/layout/crumbs';
import { GlobalSearch } from './GlobalSearch';

type TopBarProps = { onMenu: () => void };

/** Where you are and the search; on phones also the menu button. */
export function TopBar({ onMenu }: TopBarProps) {
  const { t } = useTranslation();
  const crumbs = useCrumbs();
  const last = crumbs[crumbs.length - 1];

  useEffect(() => {
    document.title = last ? `${last.label} · ${t('app.title')}` : t('app.title');
  }, [last, t]);

  return (
    <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center gap-3 border-b border-border bg-background/90 px-4 py-2.5 backdrop-blur sm:px-8">
      <button
        type="button"
        onClick={onMenu}
        aria-label={t('nav.open')}
        className="flex size-11 items-center justify-center rounded-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      <nav
        aria-label={t('nav.breadcrumb')}
        className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 text-sm"
      >
        {crumbs.map((crumb, i) => (
          <Fragment key={`${crumb.label}-${i}`}>
            {i > 0 ? (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            ) : null}
            {crumb.to && i < crumbs.length - 1 ? (
              <Link
                to={crumb.to}
                className="truncate font-sans-bold text-muted-foreground hover:text-foreground"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                aria-current={i === crumbs.length - 1 ? 'page' : undefined}
                className="truncate font-sans-black text-foreground"
              >
                {crumb.label}
              </span>
            )}
          </Fragment>
        ))}
      </nav>
      <GlobalSearch />
    </header>
  );
}

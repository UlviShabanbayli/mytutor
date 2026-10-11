import { GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router';
import { AppNav } from './AppNav';
import { ThemeToggle } from './ThemeToggle';

export function AppShell() {
  const { t } = useTranslation();
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            aria-label={t('app.home')}
            className="flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-9 items-center justify-center rounded-sm bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="font-sans-black text-lg text-foreground">{t('app.name')}</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 font-sans-bold text-xs text-secondary-foreground">
              {t('app.badge')}
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <div className="mx-auto flex max-w-screen-2xl flex-col lg:flex-row">
        <aside className="border-b border-border px-4 py-2 sm:px-6 lg:sticky lg:top-14 lg:h-[calc(100dvh-3.5rem)] lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r lg:py-6">
          <AppNav />
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

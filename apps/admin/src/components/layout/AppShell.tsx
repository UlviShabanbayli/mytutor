import { GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router';
import { ThemeToggle } from './ThemeToggle';

export function AppShell() {
  const { t } = useTranslation();
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            aria-label={t('app.home')}
            className="flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
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
      <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

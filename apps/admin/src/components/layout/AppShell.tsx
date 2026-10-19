import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';
import { Dialog } from '@/components/ui';
import { CrumbsProvider } from '@/features/layout/crumbs';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

/** Sidebar on wide screens (a sheet behind the menu button on phones), top bar, page. */
export function AppShell() {
  const { t } = useTranslation();
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();

  return (
    <CrumbsProvider>
      <div className="flex min-h-dvh bg-background">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 overflow-y-auto border-r border-border bg-card lg:block">
          <Sidebar />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onMenu={() => setMenu(true)} />
          {/* Keyed by path: every page starts at the top and drops the last page's state. */}
          <main
            key={pathname}
            className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-8 sm:py-7"
          >
            <Outlet />
          </main>
        </div>
      </div>
      <Dialog
        open={menu}
        title={t('nav.label')}
        closeLabel={t('nav.close')}
        onClose={() => setMenu(false)}
        className="m-0 h-dvh max-h-dvh w-72 max-w-[85vw] rounded-none border-y-0 border-l-0 p-0"
      >
        <Sidebar onNavigate={() => setMenu(false)} />
      </Dialog>
    </CrumbsProvider>
  );
}

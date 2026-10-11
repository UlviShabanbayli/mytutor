import {
  BookOpen,
  CircleHelp,
  Clapperboard,
  Inbox,
  LayoutGrid,
  ListChecks,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { bookTitle } from '@/features/content/pages';
import { useLibrary } from '@/features/progress/useLibrary';
import { CountBadge } from './CountBadge';
import { Logo } from './Logo';
import { SidebarLink } from './SidebarLink';
import { ThemeToggle } from './ThemeToggle';

type SidebarProps = { onNavigate?: () => void };

const icon = 'size-5 shrink-0';

/** The panel's sections, its books and how far each is; the same list opens as a sheet on phones. */
export function Sidebar({ onNavigate }: SidebarProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { index, library } = useLibrary();
  const under = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  const openFlagged = library.reduce((sum, b) => sum + b.stats.openFlagged, 0);
  const link = { onNavigate };

  return (
    <div className="flex h-full flex-col gap-5 px-3.5 py-5">
      <Logo onNavigate={onNavigate} />
      <nav aria-label={t('nav.label')} className="flex flex-col gap-0.5">
        <SidebarLink
          {...link}
          to="/"
          label={t('nav.overview')}
          icon={<LayoutGrid className={icon} />}
          active={pathname === '/'}
        />
        <SidebarLink
          {...link}
          to="/books"
          label={t('nav.books')}
          icon={<BookOpen className={icon} />}
          active={pathname === '/books'}
        />
        {library.map(({ book, stats }) => {
          const missing = stats.topics - stats.withSource;
          return (
            <SidebarLink
              {...link}
              key={book.id}
              nested
              to={`/books/${encodeURIComponent(book.id)}`}
              label={bookTitle(book)}
              active={under(`/books/${encodeURIComponent(book.id)}`)}
              badge={
                stats.openFlagged ? (
                  <CountBadge tone="destructive" value={stats.openFlagged} />
                ) : missing > 0 ? (
                  <span className="text-[11px] font-sans-bold text-muted-foreground">
                    {stats.withSource}/{stats.topics}
                  </span>
                ) : null
              }
            />
          );
        })}
        <SidebarLink
          {...link}
          to="/review"
          label={t('nav.review')}
          icon={<Inbox className={icon} />}
          active={under('/review')}
          badge={openFlagged ? <CountBadge tone="destructive" value={openFlagged} /> : null}
        />
        <SidebarLink
          {...link}
          to="/curricula"
          label={t('nav.curricula')}
          icon={<ListChecks className={icon} />}
          active={under('/curricula')}
          badge={<CountBadge value={index.data?.curricula.length ?? 0} />}
        />
        <span className="px-3 pb-1 pt-3.5 text-[11px] font-sans-black uppercase tracking-wider text-muted-foreground">
          {t('nav.later')}
        </span>
        <span
          aria-disabled="true"
          className="flex min-h-11 items-center gap-3 px-3 text-sm font-sans-medium text-muted-foreground/70"
        >
          <Clapperboard className={icon} aria-hidden />
          <span className="flex-1">{t('nav.lessons')}</span>
          <span className="text-[11px] font-sans-bold">{t('nav.soon')}</span>
        </span>
      </nav>
      <div className="flex-1" />
      <div className="flex flex-col gap-0.5">
        <SidebarLink
          {...link}
          to="/guide"
          label={t('nav.guide')}
          icon={<CircleHelp className={icon} />}
          active={under('/guide')}
        />
        <SidebarLink
          {...link}
          to="/trash"
          label={t('nav.trash')}
          icon={<Trash2 className={icon} />}
          active={under('/trash')}
          badge={<CountBadge value={index.data?.trash.length ?? 0} />}
        />
      </div>
      <ThemeToggle withLabels />
    </div>
  );
}

import { GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export function Logo({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  return (
    <Link
      to="/"
      onClick={onNavigate}
      aria-label={t('app.home')}
      className="flex items-center gap-2.5 rounded-sm px-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-9 items-center justify-center rounded-sm bg-primary text-primary-foreground">
        <GraduationCap className="size-5" aria-hidden />
      </span>
      <span className="font-sans-black text-lg text-foreground">{t('app.name')}</span>
      <span className="rounded-full bg-secondary px-2 py-0.5 font-sans-bold text-xs text-secondary-foreground">
        {t('app.badge')}
      </span>
    </Link>
  );
}

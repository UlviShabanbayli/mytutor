import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LoadingState() {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 py-16 text-muted-foreground"
    >
      <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />
      <span className="text-sm">{t('common.loading')}</span>
    </div>
  );
}

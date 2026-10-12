import { useTranslation } from 'react-i18next';
import { ComingSoon } from '@/components/coming-soon/ComingSoon';

export default function AskScreen() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      title={t('tabs.ask')}
      icon="camera-outline"
      heading={t('comingSoon.askTitle')}
      description={t('comingSoon.askDescription')}
    />
  );
}

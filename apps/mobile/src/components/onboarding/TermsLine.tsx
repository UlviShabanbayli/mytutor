import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';

/**
 * "Davam etməklə İstifadə şərtləri və Məxfilik siyasəti ilə razılaşırsan." The two names are
 * emphasised; they become links once the legal pages exist.
 */
export function TermsLine() {
  const { t } = useTranslation();

  return (
    <Text variant="caption" tone="muted" className="text-center font-sans">
      {t('onboarding.phone.termsBefore')}
      <Text className="font-sans-bold text-sm" tone="honey">
        {t('onboarding.phone.terms')}
      </Text>
      {t('onboarding.phone.termsAnd')}
      <Text className="font-sans-bold text-sm" tone="honey">
        {t('onboarding.phone.privacyPolicy')}
      </Text>
      {t('onboarding.phone.termsAfter')}
    </Text>
  );
}

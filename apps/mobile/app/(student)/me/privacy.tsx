import { useTranslation } from 'react-i18next';
import { InfoNote } from '@/components/me/InfoNote';
import { PrivacyRow } from '@/components/me/PrivacyRow';
import { Screen, ScreenHeader } from '@/components/ui';
import { privacyMatrix } from '@/features/me/privacy';
import { useMeStore } from '@/features/me/store';

/** "Məxfilik": who sees what ("Rollar və icazələr"); switches take effect at once. */
export default function PrivacyScreen() {
  const { t } = useTranslation();
  const grants = useMeStore((s) => s.grants);
  const setGrant = useMeStore((s) => s.setGrant);

  return (
    <Screen className="gap-2">
      <ScreenHeader title={t('me.privacy.title')} />
      <InfoNote icon="shield" lead={t('me.privacy.noticeLead')} status>
        {t('me.privacy.noticeBody')}
      </InfoNote>
      {privacyMatrix(grants).map((row) => (
        <PrivacyRow
          key={row.category}
          category={row.category}
          cells={row.cells}
          onToggle={setGrant}
        />
      ))}
    </Screen>
  );
}

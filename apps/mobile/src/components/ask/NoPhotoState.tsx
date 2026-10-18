import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EmptyState, Screen, ScreenHeader } from '@/components/ui';

/** Crop or send opened without a photo (a reload on the web, a stale link). */
export function NoPhotoState() {
  const { t } = useTranslation();

  return (
    <Screen>
      <ScreenHeader title={t('ask.crop.noPhotoTitle')} />
      <EmptyState
        moment="weakSpot"
        title={t('ask.crop.noPhotoTitle')}
        description={t('ask.crop.noPhotoBody')}
        actionLabel={t('ask.crop.noPhotoAction')}
        onAction={() => router.replace('/ask/camera')}
      />
    </Screen>
  );
}

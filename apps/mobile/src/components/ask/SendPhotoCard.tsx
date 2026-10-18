import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { isWholePhoto } from '@/features/ask/crop';
import type { PhotoDraft } from '@/features/ask/types';
import { PhotoThumb } from './PhotoThumb';

type SendPhotoCardProps = {
  draft: PhotoDraft;
};

/** The photo about to be sent and a way back to cropping. */
export function SendPhotoCard({ draft }: SendPhotoCardProps) {
  const { t } = useTranslation();
  const cropped = !isWholePhoto(draft.crop);

  return (
    <View className="flex-row items-center gap-3 rounded-lg border border-border bg-surf py-2 pl-3 pr-2">
      <PhotoThumb uri={draft.uri} mark="" size="md" />
      <View className="min-w-0 flex-1 gap-1">
        <Text className="font-sans-black">
          {cropped ? t('ask.send.photoCropped') : t('ask.send.photoCount')}
        </Text>
        {draft.rotation !== 0 ? (
          <Text variant="caption" tone="muted">
            {t('ask.send.photoRotated')}
          </Text>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('ask.send.changePhotoA11y')}
        onPress={router.back}
        className="min-h-touch justify-center px-3"
      >
        <Text className="font-sans-black text-honey-text">{t('ask.send.change')}</Text>
      </Pressable>
    </View>
  );
}

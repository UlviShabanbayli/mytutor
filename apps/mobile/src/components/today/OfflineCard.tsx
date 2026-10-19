import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';

type OfflineCardProps = {
  /** False when the screen below already shows Vızı (one mascot per screen). */
  withMascot: boolean;
};

/** No connection: what still works offline and that answers will be sent later. */
export function OfflineCard({ withMascot }: OfflineCardProps) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityRole="summary"
      accessibilityLiveRegion="polite"
      className="flex-row items-center gap-2.5 rounded-lg bg-info-bg px-3 py-2.5"
    >
      {withMascot ? (
        <Mascot moment="offline" size={52} decorative />
      ) : (
        <Icon name="offline" size={22} color="info" />
      )}
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-sans-black text-info">{t('today.offline.title')}</Text>
        <Text className="text-sm text-ink">{t('today.offline.body')}</Text>
      </View>
    </View>
  );
}

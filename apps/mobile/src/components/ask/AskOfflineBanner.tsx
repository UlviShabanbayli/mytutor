import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Icon, Text } from '@/components/ui';

/** Offline on the Ask tab: the sleepy Vızı and what still works (photos wait and go later). */
export function AskOfflineBanner() {
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${t('ask.home.offlineTitle')}. ${t('ask.home.offlineBody')}`}
      className="flex-row items-center gap-2.5 rounded-xl bg-info-bg px-3 py-2.5"
    >
      <Mascot mood="yuxulu" behavior="sleepy" size={52} decorative />
      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row items-center gap-1.5">
          <Icon name="offline" size={18} color="info" />
          <Text className="font-sans-black text-info">{t('ask.home.offlineTitle')}</Text>
        </View>
        <Text variant="caption" className="font-sans">
          {t('ask.home.offlineBody')}
        </Text>
      </View>
    </View>
  );
}

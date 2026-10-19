import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Text } from '@/components/ui';

/** Offline on the exam tab: sleepy Vızı and what still works without internet. */
export function OfflineNotice() {
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${t('exam.home.offlineTitle')}. ${t('exam.home.offlineBody')}`}
      className="flex-row items-center gap-2.5 rounded-xl bg-info-bg px-3 py-2"
    >
      <Mascot moment="offline" size={52} decorative />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-sans-black text-base text-info">{t('exam.home.offlineTitle')}</Text>
        <Text className="text-sm">{t('exam.home.offlineBody')}</Text>
      </View>
    </View>
  );
}

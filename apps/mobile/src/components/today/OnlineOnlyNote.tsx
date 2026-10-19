import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';

/** Offline: the parts of the app that need the internet, in place of class assignments. */
export function OnlineOnlyNote() {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-3 rounded-lg border border-dashed border-border px-3 py-2.5">
      <Icon name="offline" size={22} color="lock-ink" />
      <Text className="min-w-0 flex-1 text-sm text-lock-ink">{t('today.offline.onlineOnly')}</Text>
    </View>
  );
}

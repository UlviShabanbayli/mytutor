import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';

type NotificationPreviewProps = {
  time: string;
};

/** What the daily reminder will look like on the lock screen. */
export function NotificationPreview({ time }: NotificationPreviewProps) {
  const { t } = useTranslation();
  const appName = t('common.appName');

  return (
    <View
      accessible
      accessibilityLabel={`${t('onboarding.notifications.preview')}: ${t('onboarding.notifications.previewTitle')}`}
      className="mt-1 flex-row items-start gap-3 self-stretch rounded-2xl border border-border bg-surf px-3.5 py-3 shadow-md shadow-shadow"
    >
      <View className="h-10 w-10 items-center justify-center rounded-sm bg-honey">
        <Text className="font-display-black text-sm text-on-honey">{appName}</Text>
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row justify-between gap-2">
          <Text className="font-sans-bold text-xs uppercase" tone="muted">
            {appName}
          </Text>
          <Text className="font-sans-bold text-xs" tone="muted">
            {time}
          </Text>
        </View>
        <Text className="font-sans-black">{t('onboarding.notifications.previewTitle')}</Text>
        <Text variant="caption" tone="muted" className="font-sans">
          {t('onboarding.notifications.previewBody')}
        </Text>
      </View>
    </View>
  );
}
